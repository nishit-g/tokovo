/**
 * WhatsApp Complete Showcase DSL
 * 
 * Demonstrates all WhatsApp features:
 * - Chat list screen with multiple conversations
 * - Navigate to group chat
 * - Group admin actions (add member, change name)
 * - Mixed media messages (image, video, gif, voice)
 * - Typing indicators
 * - Reactions
 * - Screenshot alerts
 */

import { episode, whatsapp, camera } from "@tokovo/dsl";

export const whatsappCompleteShowcase = episode("WhatsApp Complete Showcase")
    .fps(30)
    .duration(1200)  // 40 seconds

    // Initial state: Chat list screen
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
            family_group: {
                id: "family_group",
                type: "group",
                name: "Family Group 👨‍👩‍👧‍👦",
                avatar: "",
                members: ["Mom", "Dad", "Sister", "me"],
                messages: [
                    {
                        id: "fg1",
                        from: "Mom",
                        text: "Dinner at 7pm tonight!",
                        type: "text",
                        status: "read"
                    }
                ],
                typing: {}
            },
            work_team: {
                id: "work_team",
                type: "group",
                name: "Work Team 💼",
                avatar: "",
                members: ["Boss", "Colleague", "me"],
                messages: [
                    {
                        id: "wt1",
                        from: "Boss",
                        text: "Great work on the presentation!",
                        type: "text",
                        status: "read"
                    }
                ],
                typing: {}
            },
            bestie: {
                id: "bestie",
                type: "dm",
                name: "Best Friend 💕",
                avatar: "",
                messages: [
                    {
                        id: "b1",
                        from: "Best Friend 💕",
                        text: "Hey! Are you free?",
                        type: "text",
                        status: "read"
                    }
                ],
                typing: {}
            }
        },
        appState: {
            activeApp: "whatsapp",
            whatsapp: {
                screen: "chats"  // Start at chat list
            }
        },
        camera: {
            baseView: "APP_VIEW",
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
            }
        },
        audio: {
            activeSounds: []
        }
    })

    // Beat 1: Show chat list (wait 1 second)
    .beat("show_chat_list", 0)

    // Beat 2: Navigate to Family Group chat
    .beat("open_family_group", 60)
    .with(whatsapp.navigate("phone", "chat", "family_group"))

    // Beat 3: Sister starts typing
    .beat("sister_typing", 120)
    .with(whatsapp.typingStart("phone", "family_group", "Sister"))

    // Beat 4: Sister sends image with caption
    .beat("sister_image", 180)
    .with(whatsapp.typingEnd("phone", "family_group", "Sister"))
    .with(whatsapp.receive("phone", "family_group", {
        from: "Sister",
        type: "image",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
        caption: "Made this for dinner! 🍝"
    }))

    // Beat 5: Mom reacts with heart
    .beat("mom_react", 240)
    .with(whatsapp.react("phone", "family_group", "fg2", "❤️", "Mom"))

    // Beat 6: I (owner) send text reply
    .beat("reply_text", 300)
    .with(whatsapp.send("phone", "family_group", {
        type: "text",
        text: "OMG looks delicious! 😍"
    }))

    // Beat 7: Dad starts typing
    .beat("dad_typing", 360)
    .with(whatsapp.typingStart("phone", "family_group", "Dad"))

    // Beat 8: Dad sends voice message
    .beat("dad_voice", 450)
    .with(whatsapp.typingEnd("phone", "family_group", "Dad"))
    .with(whatsapp.voiceReceive("phone", "family_group", "Dad", 8))

    // Beat 9: I (owner) send a GIF
    .beat("send_gif", 540)
    .with(whatsapp.send("phone", "family_group", {
        type: "gif",
        gifUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
    }))

    // Beat 10: Zoom in on the chat
    .beat("zoom_focus", 600)
    .with(camera.zoom(1.2, "center", 15))

    // Beat 11: Sister sends another text
    .beat("sister_text", 660)
    .with(whatsapp.receive("phone", "family_group", {
        from: "Sister",
        type: "text",
        text: "Can't wait to see everyone! 🎉"
    }))

    // Beat 12: Mom adds video
    .beat("mom_video", 750)
    .with(whatsapp.receive("phone", "family_group", {
        from: "Mom",
        type: "video",
        thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
        duration: 15,
        caption: "Setting up the table 🍽️"
    }))

    // Beat 13: Zoom out
    .beat("zoom_out", 840)
    .with(camera.zoom(1.0, "center", 15))

    // Beat 14: Final message
    .beat("final_message", 900)
    .with(whatsapp.send("phone", "family_group", {
        type: "text",
        text: "See you all soon! 🚗💨"
    }))

    // Beat 15: Show reactions
    .beat("final_reactions", 960)
    .with(whatsapp.react("phone", "family_group", "fg_last", "🔥", "Dad"))
    .with(whatsapp.react("phone", "family_group", "fg_last", "💕", "Mom"))

    // Beat 16: Slight shake for emphasis
    .beat("shake", 1020)
    .with(camera.shake(3, 10))

    // End
    .beat("end", 1140)

    .build();
