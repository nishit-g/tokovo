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
    index: number
) => {
    // Only handle KEYBOARD events
    if (event.kind !== "KEYBOARD") return;

    // Keyboard events target a specific device
    const deviceId = (event as any).deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // Initialize keyboard state if needed
    if (!device.keyboard) {
        device.keyboard = {
            visible: false,
            layout: "qwerty",
            currentKey: null,
            keyPressedAt: null,
            inputText: "",
            cursorPosition: 0,
            cursorVisible: true,
        };
    }

    switch (event.type) {
        case "SHOW":
            device.keyboard.visible = true;
            device.keyboard.layout = (event as any).layout || "qwerty";
            device.keyboard.inputText = "";
            device.keyboard.cursorPosition = 0;
            device.keyboard.visibilityChangedAt = event.at;
            break;

        case "HIDE":
            device.keyboard.visible = false;
            device.keyboard.currentKey = null;
            device.keyboard.visibilityChangedAt = event.at;
            break;

        case "KEY_DOWN":
            device.keyboard.currentKey = (event as any).key;
            device.keyboard.keyPressedAt = event.at;
            break;

        case "KEY_UP":
            device.keyboard.currentKey = null;
            device.keyboard.keyPressedAt = null;
            break;

        case "TYPE_CHAR": {
            const char = (event as any).char;
            // Add character to input
            const pos = device.keyboard.cursorPosition;
            const text = device.keyboard.inputText;
            const newText = text.slice(0, pos) + char + text.slice(pos);
            device.keyboard.inputText = newText;
            device.keyboard.cursorPosition = pos + 1;
            device.keyboard.currentKey = char;
            device.keyboard.keyPressedAt = event.at;

            // AUTOMATION: Inject into App
            injectInputToApp(draft, device.foregroundAppId, newText, event.at);
            break;
        }

        case "BACKSPACE": {
            if (device.keyboard.cursorPosition > 0) {
                const pos = device.keyboard.cursorPosition;
                const text = device.keyboard.inputText;
                const newText = text.slice(0, pos - 1) + text.slice(pos);
                device.keyboard.inputText = newText;
                device.keyboard.cursorPosition = pos - 1;

                // AUTOMATION: Inject into App
                injectInputToApp(draft, device.foregroundAppId, newText, event.at);
            }
            device.keyboard.currentKey = "⌫";
            device.keyboard.keyPressedAt = event.at;
            break;
        }

        case "SET_TEXT": {
            const text = (event as any).text;
            device.keyboard.inputText = text;
            device.keyboard.cursorPosition = text.length;
            // AUTOMATION: Inject into App
            injectInputToApp(draft, device.foregroundAppId, text, event.at);
            break;
        }

        case "CLEAR":
            device.keyboard.inputText = "";
            device.keyboard.cursorPosition = 0;
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
