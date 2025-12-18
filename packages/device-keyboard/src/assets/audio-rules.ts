import { AutoSoundRule } from "@tokovo/core";

export const keyboardAudioRules: AutoSoundRule[] = [
    // === V2 OPS ===
    // Matches "KeyboardType" events from new DSL
    // DISABLED: Rely on discrete KeyDown clicks instead of loops for manual typing
    // {
    //     match: { kind: "KeyboardType" },
    //     action: "START_LOOP",
    //     sound: "keyboard_typing_loop",
    //     volume: 0.8,
    //     durationFrom: {
    //         key: "text.length",
    //         factor: 4, // 4 frames per char
    //         min: 15    // Min 15 frames
    //     },
    //     idTemplate: "typing_loop_{at}"
    // },
    {
        match: { kind: "APP", appId: "keyboard", type: "KEY_DOWN" },
        action: "PLAY_ONE_SHOT",
        sound: "keyboard_typing_loop",
        volume: 0.6
    },


];
