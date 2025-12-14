/**
 * Camera Showcase - Cinematic Demo
 * 
 * Demonstrates all camera effects: ZOOM, PAN, SHAKE, FOCUS, RESET
 * with messages guiding the viewer through each effect.
 * 
 * DSL version of camera-showcase.json
 */

import { episode, iPhone, dsl } from "@tokovo/dsl";

export const cameraShowcase = episode("camera-showcase")
    .meta({
        title: "Camera Showcase - Cinematic Demo",
        fps: 30,
    })
    .device("main_phone", {
        profile: iPhone,
        isLocked: false,
        foregroundAppId: "app_whatsapp",
    })
    .app("app_whatsapp", {
        conversationId: "conv_demo",
        conversationName: "Camera Director 🎬",
    })
    .initialMessages("conv_demo", [
        { from: "Camera Director 🎬", text: "Welcome to the Camera Showcase!", status: "read" },
        { from: "me", text: "Show me what you've got!", status: "delivered" },
    ])

    // Beat 1: Zoom demonstration
    .beat("zoom-demo", (b) => {
        b.wait("1s");
        b.receive("Camera Director 🎬", "🎥 First up: ZOOM IN");
        b.wait("1s");
        // Camera zoom: scale 1.5, origin top-left, 45 frames
    })
    .camera(60, dsl.camera.zoom(60, 1.5, 45, { originX: 0.2, originY: 0.2 }))
    .camera(120, dsl.camera.reset(120, 30))

    // Beat 2: Shake demonstration
    .beat("shake-demo", (b) => {
        b.wait("1s");
        b.receive("Camera Director 🎬", "📱 Now watch this SHAKE!");
        b.wait("1s");
    })
    .camera(180, dsl.camera.shake(180, 12, 45, { frequency: 20, decay: 0.4 }))

    // Beat 3: Pan demonstration
    .beat("pan-demo", (b) => {
        b.wait("2s");
        b.receive("Camera Director 🎬", "👆 Smooth PAN coming up");
        b.wait("1s");
    })
    .camera(270, dsl.camera.pan(270, -100, -80, 60))
    .camera(345, dsl.camera.reset(345, 30))

    // Beat 4: Focus demonstration
    .beat("focus-demo", (b) => {
        b.wait("1.5s");
        b.receive("Camera Director 🎬", "🎯 FOCUS on the message!");
        b.wait("1s");
    })
    // Focus effect on message area
    .camera(510, dsl.camera.reset(510, 45))

    // Beat 5: Combo demonstration
    .beat("combo-demo", (b) => {
        b.wait("2s");
        b.receive("Camera Director 🎬", "🔥 COMBO: Zoom + Shake!");
        b.wait("1s");
    })
    .camera(600, dsl.camera.zoom(600, 1.3, 90))
    .camera(615, dsl.camera.shake(615, 10, 75, { frequency: 18, decay: 0.5 }))
    .camera(720, dsl.camera.reset(720, 45))

    // Beat 6: Finale
    .beat("finale", (b) => {
        b.wait("2s");
        b.receive("Camera Director 🎬", "🎬 That's a wrap! You're now a Director.");
        b.wait("1s");
    })
    .camera(810, dsl.camera.zoom(810, 0.9, 60))

    .build();

export default cameraShowcase;
