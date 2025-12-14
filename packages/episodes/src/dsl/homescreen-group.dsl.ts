/**
 * Home Screen & Group Chat Complete Demo
 * 
 * Showcases iOS home screen, notifications, app badges,
 * and WhatsApp group chat with member additions.
 * 
 * DSL version of homescreen-group-demo.json
 */

import { episode, iPhone } from "@tokovo/dsl";

export const homescreenGroup = episode("homescreen-group")
    .meta({
        title: "Home Screen & Group Chat Complete Demo",
        fps: 30,
    })
    .device("user_phone", {
        profile: iPhone,
        isLocked: true,
    })
    .app("app_whatsapp", {
        conversationId: "group_family",
        conversationName: "Family Group 👨‍👩‍👧",
        isGroup: true,
    })
    .initialMessages("group_family", [
        { from: "Mom", text: "Good morning everyone! ☀️", status: "read" },
        { from: "Dad", text: "Morning! How's everyone doing?", status: "read" },
        { from: "me", text: "Hi mom! Hi dad! 👋", status: "read" },
        { from: "Sarah", text: "Just woke up lol", status: "read" },
        { from: "Mom", text: "Don't forget we have dinner at 7pm tomorrow!", status: "read" },
        { from: "me", text: "I'll be there! Should I bring anything? 🍕", status: "read" },
        { from: "Dad", text: "Just bring yourself 😊", status: "read" },
        { from: "Sarah", text: "Can I bring a friend?", status: "delivered" },
    ])

    // Beat 1: Lock screen notification
    .beat("notification", (b) => {
        b.showNotification("app_whatsapp", {
            title: "Family Group 👨‍👩‍👧",
            body: "Mom: Don't forget dinner tomorrow!",
            mode: "lockscreen",
        });
    })

    // Beat 2: Unlock and home
    .beat("unlock", (b) => {
        b.wait("2s");
        b.unlock();
        b.wait("1s");
    })

    // Beat 3: Open WhatsApp
    .beat("open-whatsapp", (b) => {
        b.wait("3s");
        b.openApp("app_whatsapp");
    })

    // Beat 4: Mom responds
    .beat("mom-responds", (b) => {
        b.wait("2s");
        b.typing("Mom").for("2s");
        b.receive("Mom", "Of course Sarah! Who do you want to bring?");
    })

    // Beat 5: Sarah responds
    .beat("sarah-responds", (b) => {
        b.typing("Sarah").for("2s");
        b.receive("Sarah", "My friend Emma! She's really nice 😊");
    })

    // Beat 6: Emma joins
    .beat("emma-joins", (b) => {
        b.wait("2s");
        b.memberAdded("Emma", "Sarah");
    })

    // Beat 7: Emma introduces herself
    .beat("emma-intro", (b) => {
        b.wait("2s");
        b.typing("Emma").for("2s");
        b.receive("Emma", "Hi everyone! Thanks for having me! 🙏");
    })

    // Beat 8: Mom welcomes Emma
    .beat("mom-welcomes", (b) => {
        b.wait("2s");
        b.receive("Mom", "Welcome Emma! We're happy to have you 💕");
    })

    // Beat 9: Wrap up
    .beat("wrapup", (b) => {
        b.wait("2s");
        b.send("Looking forward to it! See you all tomorrow!");
        b.wait("2s");
    })

    // Beat 10: Final notification
    .beat("final-notification", (b) => {
        b.wait("2s");
        b.showNotification("app_whatsapp", {
            title: "Emma",
            body: "Thanks for adding me! 🙏",
            mode: "headsup",
        });
    })

    .build();

export default homescreenGroup;
