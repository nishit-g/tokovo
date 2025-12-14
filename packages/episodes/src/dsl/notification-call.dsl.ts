/**
 * Notification & Call Demo
 * 
 * Comprehensive test of lockscreen, notifications, and call features.
 * Features voice calls, video calls, and various notification modes.
 * 
 * DSL version of notification-call-demo.json
 */

import { episode, iPhone } from "@tokovo/dsl";

export const notificationCall = episode("notification-call")
    .meta({
        title: "Notification & Call Demo",
        description: "Comprehensive test of lockscreen, notifications, and call features",
        fps: 30,
    })
    .device("user_phone", {
        profile: iPhone,
        isLocked: true,
    })

    // Beat 1: Lock screen notifications
    .beat("lock-notifications", (b) => {
        b.showNotification("app_whatsapp", {
            title: "Sarah",
            body: "Hey! Are you free tonight?",
            mode: "lockscreen",
        });
        b.wait("1.5s");
        b.showNotification("app_instagram", {
            title: "mike_photos",
            body: "Liked your photo ❤️",
            mode: "lockscreen",
        });
    })

    // Beat 2: Unlock and open WhatsApp
    .beat("unlock-open", (b) => {
        b.wait("1.5s");
        b.unlock();
        b.wait("0.5s");
        b.openApp("app_whatsapp");
        b.wait("0.5s");
        b.receive("other", "Are you there?");
    })

    // Beat 3: Heads-up notification
    .beat("headsup", (b) => {
        b.wait("1s");
        b.showNotification("app_instagram", {
            title: "Instagram",
            body: "3 people liked your story",
            mode: "headsup",
        });
    })

    // Beat 4: Incoming voice call
    .beat("voice-call", (b) => {
        b.wait("2s");
        b.incomingCall("sarah_id", "Sarah", {
            avatarUrl: "https://i.pravatar.cc/300?u=sarah",
            isVideo: false,
        });
        b.wait("2s");
        b.answerCall();
        b.wait("4s");
        b.endCall();
    })

    // Beat 5: Post-call notification
    .beat("post-call", (b) => {
        b.wait("1s");
        b.showNotification("app_whatsapp", {
            title: "Sarah",
            body: "That was a great call! Talk later 👋",
            mode: "headsup",
        });
    })

    // Beat 6: Video call
    .beat("video-call", (b) => {
        b.wait("3s");
        b.incomingCall("mike_id", "Mike", { isVideo: true });
        b.wait("2s");
        b.answerCall();
        b.wait("3s");
        b.endCall();
    })

    .build();

export default notificationCall;
