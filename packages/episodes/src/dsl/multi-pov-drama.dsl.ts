/**
 * Two Sides of the Story - Multi-POV Demo
 * 
 * Demonstrates multi-device storytelling with split screen,
 * picture-in-picture, and camera cuts between Alice and Bob.
 * 
 * DSL version of multi-pov-demo.json
 */

import { episode, iPhone, dsl } from "@tokovo/dsl";

export const multiPovDrama = episode("multi-pov-drama")
    .meta({
        title: "Two Sides of the Story - Multi-POV Demo",
        fps: 30,
    })
    .device("alice_phone", {
        profile: iPhone,
        ownerName: "Alice",
        isLocked: false,
        foregroundAppId: "app_whatsapp",
    })
    .device("bob_phone", {
        profile: iPhone,
        ownerName: "Bob",
        isLocked: false,
        foregroundAppId: "app_whatsapp",
    })
    .app("app_whatsapp", {
        conversationId: "alice_bob_chat",
    })
    .initialMessages("alice_bob_chat", [
        { from: "Alice", text: "Hey, where are you?", status: "read" },
    ])

    // Beat 1: Alice's POV - Bob responds
    .beat("alice-pov-start", (b) => {
        b.wait("1s");
        b.receive("Bob", "On my way! 🚗");
    })
    .camera(30, dsl.audio.play(30, "whatsapp_received"))

    // Beat 2: Cut to Bob's POV
    .beat("bob-pov", (b) => {
        b.wait("2s");
        // Cut happens via camera event
        b.wait("1s");
        b.receive("Alice", "You said that 20 minutes ago 😤");
    })
    .camera(90, { at: 90, kind: "CAMERA", type: "CUT", toDeviceId: "bob_phone" })

    // Beat 3: Split screen - both phones
    .beat("split-screen", (b) => {
        b.wait("2s");
        // Split layout via camera
        b.wait("1s");
        b.receive("Bob", "Traffic is crazy! 😅");
        b.wait("3s");
        b.receive("Alice", "Send me your location");
    })

    // Beat 4: PIP mode - Bob main, Alice corner
    .beat("pip-mode", (b) => {
        b.wait("2s");
        b.receive("Bob", "📍 Sharing location...");
    })

    // Beat 5: Vertical split
    .beat("vertical-split", (b) => {
        b.wait("5s");
        b.receive("Alice", "Wait... that's not the way here 🤔");
    })

    // Beat 6: Alice alone - dramatic shake
    .beat("dramatic-alice", (b) => {
        b.wait("2s");
        // Shake effect
        b.wait("2s");
    })

    // Beat 7: Finale
    .beat("finale", (b) => {
        b.wait("1s");
        b.receive("Alice", "WHERE ARE YOU GOING?! 😡");
    })

    .build();

export default multiPovDrama;
