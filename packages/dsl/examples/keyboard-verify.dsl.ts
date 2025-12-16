/**
 * Keyboard Verification DSL
 * 
 * Verifies:
 * 1. OS-level keyboard handling (typing -> input change)
 * 2. WhatsApp input draft updates
 * 3. Notification system
 * 4. Camera integration
 */

import { episode, whatsapp, camera, keyboard, TimelineEvent } from "../src";

// Helper to generate realistic typing sequence
function typeText(startFrame: number, deviceId: string, text: string): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    let t = startFrame;

    // 1. Show Keyboard
    events.push(keyboard.show(t, deviceId));
    t += 15; // Wait for animation

    // 2. Type characters
    for (const char of text) {
        // Press down
        events.push(keyboard.keyDown(t, deviceId, char));
        // Register char (Input Injection happens here)
        events.push(keyboard.typeChar(t, deviceId, char));
        t += 2;
        // Release
        events.push(keyboard.keyUp(t, deviceId));
        t += 3; // Typing speed delay
    }

    // 3. Hide Keyboard (optional, usually happens on send)
    // events.push(keyboard.hide(t, deviceId)); 

    return events;
}

export const keyboardVerifyShowcase = episode("Keyboard Verification")
    .fps(30)
    .duration(900) // 30 seconds

    // Initial World setup
    .initialWorld({
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                ownerName: "me",
                notifications: [],
                keyboard: { // Ensure clean state
                    visible: false,
                    layout: "qwerty",
                    currentKey: null,
                    keyPressedAt: null,
                    inputText: "",
                    cursorPosition: 0,
                    cursorVisible: true
                }
            }
        },
        conversations: {
            chat_01: {
                id: "chat_01",
                type: "dm",
                name: "Alice 🌸",
                messages: [
                    { id: "m1", from: "Alice 🌸", text: "Are you ready?", type: "text", status: "read" }
                ],
                typing: {}
            }
        },
        appState: {
            activeApp: "whatsapp",
            whatsapp: {
                screen: "chat",
                conversationId: "chat_01" // Start directly in chat
            }
        },
        camera: {
            baseView: "APP_VIEW",
            activeEffects: []
        }
    })

    // Beat 0: Initial focus
    .beat("start", 0)
    .with(camera.zoom(1.0, "center", 0))

    // Beat 1: Focus on input area (Manual Camera Move)
    .beat("focus_input", 30)
    // Assuming input area is at bottom. Using manual pan/zoom for now as we don't have Anchor Provider fully wired in DSL yet?
    // Actually, ANCHOR_FOCUS is supported by engine, but let's use manual for safety in verification.
    .with(camera.pan(0, 200, 30)) // Move down
    .with(camera.zoom(1.2, "center", 30))

    // Beat 2: Start typing "I was born ready"
    .beat("start_typing", 65)
    .with(...typeText(65, "phone", "I was born ready"))

    // Beat 3: Reset Camera (Pull back to see full chat)
    .beat("pull_back", 150) // Adjust timing based on typing length
    .with(camera.reset(20))

    // Beat 4: Send the message
    .beat("send_msg", 180)
    .with(whatsapp.send("phone", "chat_01", {
        type: "text",
        text: "I was born ready"
    }))
    .with(keyboard.hide(180, "phone")) // Hide keyboard on send
    .with(keyboard.clear(180, "phone")) // Clear input buffer

    // Beat 5: Alice replies (Notification test - if we were in another app, but here just in-chat receive)
    .beat("alice_reply", 240)
    .with(whatsapp.typingStart("phone", "chat_01", "Alice 🌸"))

    .beat("alice_sent", 280)
    .with(whatsapp.typingEnd("phone", "chat_01", "Alice 🌸"))
    .with(whatsapp.receive("phone", "chat_01", {
        from: "Alice 🌸",
        text: "Let's do this! 🚀"
    }))

    // Beat 6: Verification of Semantic Camera (Anchor Focus)
    .beat("focus_reply", 300)
    // Using the 'lastMessage' anchor if available
    .with({
        at: 300,
        kind: "CameraAnchorFocus",
        anchor: "lastMessage",
        duration: 30
    } as any) // Using raw event as builder might not be updated

    .build();
