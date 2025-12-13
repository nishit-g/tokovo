/**
 * Ultimate Feature Showcase
 * 
 * This DSL episode demonstrates ALL features:
 * - Text messages (send/receive)
 * - Media messages (image, video, GIF, voice)
 * - Navigation (showScreen, openChat, goBack)
 * - Typing indicators
 * - Concurrent actions
 * - Multi-POV (camera, owner)
 * - Semantic annotations
 */

import { episode } from "../src";

export const ultimateShowcase = episode("ultimate-showcase", ep => {
    ep.config({
        fps: 30,
        title: "Ultimate Feature Showcase",
    });

    // =========================================================================
    // DEVICE 1: Alice's Phone
    // =========================================================================
    ep.device("AlicePhone", "iphone16", d => {
        d.owner("Alice");
        d.app("app_whatsapp");
        d.conversation("dm_bob", { name: "Bob 💕", type: "dm" });

        // =====================================================================
        // Beat 1: Opening Navigation
        // =====================================================================
        d.beat("navigation-intro", b => {
            b.showScreen("chats-list");
            b.wait("2s");
            b.openChat("dm_bob");
            b.wait("500ms");
        });

        // =====================================================================
        // Beat 2: Text Message Exchange
        // =====================================================================
        d.beat("text-exchange", b => {
            b.receive("Bob", "Hey Alice! Check out this vacation photo 🏖️", {
                mood: "excited",
                intensity: 0.7,
            });
            b.wait("1.5s");
            b.send("OMG that looks amazing! ✨");
            b.wait("1s");
        });

        // =====================================================================
        // Beat 3: Media Messages
        // =====================================================================
        d.beat("media-showcase", b => {
            // Receive an image
            b.receiveImage("Bob", "https://picsum.photos/800/600", {
                caption: "Sunset from the beach! 🌅",
                height: 450,
            });
            b.wait("2s");

            // Send a voice note
            b.sendVoice(8);  // 8 second voice message
            b.wait("1s");

            // Receive a GIF
            b.receiveGif("Bob", "https://media.giphy.com/media/sample.gif");
            b.wait("1.5s");
        });

        // =====================================================================
        // Beat 4: Typing Indicator
        // =====================================================================
        d.beat("typing-demo", b => {
            b.typing("Bob").for("3s");
            b.receive("Bob", "Can't wait to show you the video!");
        });

        // =====================================================================
        // Beat 5: Video Message
        // =====================================================================
        d.beat("video-message", b => {
            b.receiveVideo("Bob", "https://example.com/vacation.mp4", 15, {
                caption: "Swimming with dolphins! 🐬",
                height: 500,
            });
            b.wait("3s");
            b.send("I'm so jealous right now 😭", { mood: "sad", intensity: 0.4 });
        });

        // =====================================================================
        // Beat 6: Concurrent Messages (Message Storm)
        // =====================================================================
        d.beat("message-storm", b => {
            b.concurrent([
                t => {
                    t.receive("Bob", "You should come next time!");
                },
                t => {
                    t.wait("300ms");
                    t.receive("Bob", "It's only a 2 hour flight");
                },
                t => {
                    t.wait("600ms");
                    t.receive("Bob", "I can get you a discount at the resort");
                },
            ]);
            b.wait("2s");
        });

        // =====================================================================
        // Beat 7: Final Response
        // =====================================================================
        d.beat("finale", b => {
            b.send("Okay okay, I'm booking it! 🎉", {
                mood: "excited",
                intensity: 0.9,
            });
            b.wait("1s");
            b.receive("Bob", "YES! 🎊🎊🎊");
            b.wait("2s");
            b.goBack();
        });
    });

    // =========================================================================
    // CAMERA OPERATIONS (Optional Multi-POV)
    // =========================================================================
    ep.camera(c => {
        c.at("0s").cut("AlicePhone");
        // Future: Could add BobPhone and switch between them
    });
});

export default ultimateShowcase;
