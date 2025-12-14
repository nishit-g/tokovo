/**
 * Android Test
 * 
 * Basic Android device test with notification and app launch.
 * Uses Pixel device profile instead of iPhone.
 * 
 * DSL version of android-test.json
 */

import { episode, Pixel } from "@tokovo/dsl";

export const androidTest = episode("android-test")
    .meta({
        title: "Android Device Test",
        fps: 30,
    })
    .device("bob_phone", {
        profile: Pixel,
        isLocked: true,
    })
    .initialMessages("conv_1", [
        { from: "other", text: "Hey Bob!" },
    ])

    // Beat 1: Notification on lock screen
    .beat("notification", (b) => {
        b.wait("0.3s");
        b.showNotification("app_whatsapp", {
            title: "Alice",
            body: "Hey Bob!",
        });
    })

    // Beat 2: Unlock
    .beat("unlock", (b) => {
        b.wait("1.7s");
        b.unlock();
    })

    // Beat 3: Open WhatsApp
    .beat("open-whatsapp", (b) => {
        b.wait("0.3s");
        b.openApp("app_whatsapp");
    })

    .build();

export default androidTest;
