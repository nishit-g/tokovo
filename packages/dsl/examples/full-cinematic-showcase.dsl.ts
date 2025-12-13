/**
 * Full Cinematic Showcase DSL
 * 
 * Production-grade DSL episode demonstrating:
 * - Cinematic camera movements (PAN, ZOOM, SHAKE)
 * - Production audio (music, sounds, ducking)
 * - WhatsApp drama story
 * 
 * This is the PROPER way to author episodes - using DSL, not JSON.
 */

import { episode, whatsapp, camera, audio } from "@tokovo/dsl";

export const fullCinematicShowcase = episode("Full Cinematic Showcase")
    .fps(30)
    .duration(720)  // 24 seconds

    // Initial state
    .initialWorld({
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                ownerName: "me",
                notifications: []
            }
        },
        conversations: {
            dm_ex: {
                id: "dm_ex",
                type: "dm",
                name: "Ex 💔",
                avatar: "",
                messages: [],
                typing: {}
            }
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_ex"
            }
        },
        camera: {
            baseView: "APP_VIEW",
            activeDeviceId: "phone",
            layout: {
                mode: "SINGLE",
                primaryDeviceId: "phone"
            },
            activeEffects: [],
            transform: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotation: 0,
                originX: 0.5,
                originY: 0.5,
                shakeX: 0,
                shakeY: 0
            },
            deviceTransforms: {}
        },
        audio: {
            activeSounds: {},
            buses: {
                music: { baseGain: 0.3, maxConcurrent: 1 },
                ui: { baseGain: 0.9, maxConcurrent: 3 },
                sfx: { baseGain: 0.7, maxConcurrent: 4 },
                voice: { baseGain: 1.0, maxConcurrent: 1 }
            }
        }
    })

    // =========================================================================
    // BEAT 0: ESTABLISHING (0s)
    // Background music + macro pan from bottom
    // =========================================================================
    .beat("music_start", 0)
    .with(audio.dramaticMood({ volume: 0.25 }))

    .beat("establishing_zoom", 0)
    .with(camera.zoom(1.15, "bottom", 1, { easing: "linear" }))

    .beat("pan_up", 1)
    .with(camera.pan(0, -150, 75, { easing: "ease-in-out" }))

    .beat("reveal_zoom", 30)
    .with(camera.zoom(1.0, "center", 60, { easing: "ease-out" }))

    // =========================================================================
    // BEAT 1: FIRST MESSAGE (3s)
    // Message arrives + sound + camera tracks
    // =========================================================================
    .beat("first_message", 90)
    .with(whatsapp.receive("phone", "dm_ex", {
        from: "Ex 💔",
        type: "text",
        text: "We need to talk."
    }))
    .with(audio.whatsappReceived())

    .beat("track_message", 90)
    .with(camera.pan(0, 50, 45, { easing: "ease-out" }))

    .beat("focus_push", 100)
    .with(camera.zoom(1.03, "center", 35, {
        easing: "ease-out",
        originX: 0.5,
        originY: 0.75
    }))

    // =========================================================================
    // BEAT 2: TYPING ANTICIPATION (5s)
    // Typing indicator + sound + camera push
    // =========================================================================
    .beat("typing_start", 150)
    .with(whatsapp.typingStart("phone", "dm_ex", "Ex 💔"))
    .with(audio.typing(90))

    .beat("tension_push", 150)
    .with(camera.zoom(1.05, "bottom", 75, { easing: "ease-out" }))

    // =========================================================================
    // BEAT 3: THE REVEAL (8s)
    // Long message drops - snap camera
    // =========================================================================
    .beat("typing_end", 240)
    .with(whatsapp.typingEnd("phone", "dm_ex", "Ex 💔"))
    .with(audio.typingStop())

    .beat("reveal_message", 240)
    .with(whatsapp.receive("phone", "dm_ex", {
        from: "Ex 💔",
        type: "text",
        text: "I've been thinking about us a lot lately... and I don't think this is working anymore."
    }))
    .with(audio.whatsappReceived({ volume: 1.0 }))
    .with(camera.zoom(1.12, "center", 8, { easing: "ease-out" }))

    // =========================================================================
    // BEAT 4: BREATHING ROOM (10s)
    // Pull out wide
    // =========================================================================
    .beat("breathe", 300)
    .with(camera.zoom(0.92, "center", 60, { easing: "ease-in-out" }))

    // =========================================================================
    // BEAT 5: RAPID FIRE ESCALATION (12s-16s)
    // Quick cuts between speakers
    // =========================================================================
    .beat("hello", 360)
    .with(whatsapp.receive("phone", "dm_ex", {
        from: "Ex 💔",
        type: "text",
        text: "Hello?"
    }))
    .with(audio.whatsappReceived({ volume: 0.8 }))
    .with(camera.zoom(1.06, "center", 8, { originX: 0.35, originY: 0.8 }))

    .beat("reply_1", 385)
    .with(whatsapp.send("phone", "dm_ex", {
        type: "text",
        text: "What do you mean?"
    }))
    .with(audio.whatsappSent())
    .with(camera.zoom(1.09, "center", 8, { originX: 0.65, originY: 0.82 }))

    .beat("accusation", 410)
    .with(whatsapp.receive("phone", "dm_ex", {
        from: "Ex 💔",
        type: "text",
        text: "You know exactly what I mean."
    }))
    .with(audio.whatsappReceived({ volume: 0.9 }))
    .with(camera.zoom(1.13, "center", 6, { originX: 0.35 }))

    .beat("confusion", 430)
    .with(whatsapp.send("phone", "dm_ex", {
        type: "text",
        text: "I don't understand..."
    }))
    .with(audio.whatsappSent())
    .with(camera.zoom(1.16, "center", 6, { originX: 0.65 }))

    // =========================================================================
    // BEAT 6: THE BOMB (16s)
    // "It's over" - shake + dramatic sound
    // =========================================================================
    .beat("the_bomb", 480)
    .with(whatsapp.receive("phone", "dm_ex", {
        from: "Ex 💔",
        type: "text",
        text: "It's over."
    }))
    .with(audio.notification())
    .with(camera.shake(12, 20, { decay: 0.5 }))
    .with(camera.zoom(1.25, "center", 12, { originX: 0.4, originY: 0.88 }))

    // =========================================================================
    // BEAT 7: AFTERMATH (18s-24s)
    // Reply, slow reset
    // =========================================================================
    .beat("aftermath", 540)
    .with(whatsapp.send("phone", "dm_ex", {
        type: "text",
        text: "..."
    }))
    .with(audio.whatsappSent({ volume: 0.5 }))
    .with(camera.zoom(1.0, "center", 90, { easing: "ease-in-out" }))

    .beat("end", 660)

    .build();
