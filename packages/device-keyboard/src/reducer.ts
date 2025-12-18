import {
    WorldState,
    TimelineEvent,
    ReducerRegistry,
    FeatureReducer
} from "@tokovo/core";

/**
 * processKeyboardEvent
 * 
 * Handles all KEYBOARD specific events.
 * Manages the virtual keyboard state in `device.keyboard`.
 * Automatically injects INPUT_CHANGE events into the foreground app.
 */
export const keyboardReducer: FeatureReducer = (
    draft: WorldState,
    event: TimelineEvent,
    index?: number
) => {
    // Shared Device Access
    const eventAny = event as any;
    const deviceId = eventAny.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // INITIALIZATION: The "Gold Standard" of robustness.
    // Ensure device.keyboard always exists if a keyboard event is being processed.
    if (!device.keyboard) {
        device.keyboard = {
            visible: false,
            layout: "qwerty",
            currentKey: null,
            keyPressedAt: null,
            inputText: "",
            cursorPosition: 0,
            cursorVisible: true,
            visibilityChangedAt: -1,
            suggestions: [],
            highlightedSuggestion: null,
            selectionStart: null,
            selectionEnd: null,
            keyPressVisual: null,
        } as any;
    }

    const keyboard = device.keyboard!;

    // Handle V2 Ops
    if (event.kind === "KeyboardType") {
        const e = event as import("@tokovo/ir").KeyboardTypeOp;
        // Append text (simulating typing)
        const textToAppend = e.text;
        const pos = keyboard.cursorPosition;
        const currentText = keyboard.inputText;
        const newText = currentText.slice(0, pos) + textToAppend + currentText.slice(pos);

        keyboard.inputText = newText;
        keyboard.cursorPosition = pos + textToAppend.length;

        // AUTOMATION: Inject into App
        injectInputToApp(draft, device.foregroundAppId, newText, event.at);

        // AUDIO: Handled by AutoSound Rules
        return;
    }

    if (event.kind === "KeyboardInput") {
        const e = event as import("@tokovo/ir").KeyboardInputOp;
        if (e.type === "keyDown") {
            keyboard.currentKey = e.key;
            keyboard.keyPressedAt = event.at;

            // Handle Backspace logic for V2
            if (e.key === "Backspace") {
                const pos = keyboard.cursorPosition;
                const text = keyboard.inputText;
                if (pos > 0) {
                    const newText = text.slice(0, pos - 1) + text.slice(pos);
                    keyboard.inputText = newText;
                    keyboard.cursorPosition = pos - 1;
                    // Inject into App
                    injectInputToApp(draft, device.foregroundAppId, newText, event.at);
                }
            }

            // AUDIO: Handled by AutoSound Rules
        } else {
            keyboard.currentKey = null;
            keyboard.keyPressedAt = null;
        }
        return;
    }

    // Handle V2 Ops & Legacy Ops
    // We remove the strict kind guard to allow this to act as both a FeatureReducer 
    // and an AppReducer for kind: "APP", appId: "keyboard".

    const eventType = (event as any).type;

    switch (eventType) {
        case "SHOW":
            keyboard.visible = true;
            keyboard.layout = (event as any).layout || "qwerty";
            keyboard.inputText = "";
            keyboard.cursorPosition = 0;
            keyboard.visibilityChangedAt = event.at;
            break;

        case "HIDE":
            keyboard.visible = false;
            keyboard.currentKey = null;
            keyboard.visibilityChangedAt = event.at;
            break;

        case "KEY_DOWN": {
            const key = (event as any).key;
            keyboard.currentKey = key;
            keyboard.keyPressedAt = event.at;

            // Handle character insertion for printable keys
            if (key.length === 1) {
                const pos = keyboard.cursorPosition;
                const text = keyboard.inputText;
                const newText = text.slice(0, pos) + key + text.slice(pos);
                keyboard.inputText = newText;
                keyboard.cursorPosition = pos + 1;

                // AUTOMATION: Inject into App
                injectInputToApp(draft, device.foregroundAppId, newText, event.at);
            } else if (key === "Backspace") {
                const pos = keyboard.cursorPosition;
                const text = keyboard.inputText;
                if (pos > 0) {
                    const newText = text.slice(0, pos - 1) + text.slice(pos);
                    keyboard.inputText = newText;
                    keyboard.cursorPosition = pos - 1;
                    // Inject into App
                    injectInputToApp(draft, device.foregroundAppId, newText, event.at);
                }
            }
            break;
        }

        case "KEY_UP":
            keyboard.currentKey = null;
            keyboard.keyPressedAt = null;
            break;

        case "TYPE_CHAR": {
            const char = (event as any).char;
            // Add character to input
            const pos = keyboard.cursorPosition;
            const text = keyboard.inputText;
            const newText = text.slice(0, pos) + char + text.slice(pos);
            keyboard.inputText = newText;
            keyboard.cursorPosition = pos + 1;
            keyboard.currentKey = char;
            keyboard.keyPressedAt = event.at;

            // AUTOMATION: Inject into App
            injectInputToApp(draft, device.foregroundAppId, newText, event.at);
            // AUDIO: Handled by AutoSound Rules
            break;
        }

        case "BACKSPACE": {
            if (keyboard.cursorPosition > 0) {
                const pos = keyboard.cursorPosition;
                const text = keyboard.inputText;
                const newText = text.slice(0, pos - 1) + text.slice(pos);
                keyboard.inputText = newText;
                keyboard.cursorPosition = pos - 1;

                // AUTOMATION: Inject into App
                injectInputToApp(draft, device.foregroundAppId, newText, event.at);
            }
            keyboard.currentKey = "⌫";
            keyboard.keyPressedAt = event.at;
            // AUDIO: Handled by AutoSound Rules
            break;
        }

        case "SET_TEXT": {
            const text = (event as any).text;
            keyboard.inputText = text;
            keyboard.cursorPosition = text.length;
            // AUTOMATION: Inject into App
            injectInputToApp(draft, device.foregroundAppId, text, event.at);
            break;
        }

        case "CLEAR":
            keyboard.inputText = "";
            keyboard.cursorPosition = 0;
            // AUTOMATION: Inject into App
            injectInputToApp(draft, device.foregroundAppId, "", event.at);
            break;
    }
};

/**
 * Helper to push input changes to the active app
 */
function injectInputToApp(draft: WorldState, appId: string | undefined, text: string, at: number) {
    if (!appId) return;
    const reducer = ReducerRegistry.getAppReducer(appId);
    if (reducer) {
        reducer(draft, { // Use legacy event format expected by apps
            kind: "APP",
            type: "INPUT_CHANGE",
            appId,
            payload: { text },
            at
        } as any);
    }
}
