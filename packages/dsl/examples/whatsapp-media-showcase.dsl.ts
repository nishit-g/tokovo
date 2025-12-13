/**
 * WhatsApp Media Showcase Episode
 * 
 * This episode demonstrates all new DSL media features:
 * - Image messages with captions
 * - Video messages with thumbnails
 * - GIF messages
 * - Voice notes
 * - Auto-timing (no explicit waits needed)
 * - Typing indicators
 * 
 * Run: npx ts-node --esm whatsapp-media-showcase.dsl.ts
 */

import { createEpisode, SceneIR } from "@tokovo/dsl";

export const mediaShowcaseSceneIR: SceneIR = createEpisode("whatsapp-media-showcase", ep => {
    ep.config({ fps: 30, title: "Media Showcase" });

    ep.device("MyPhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_bestie", { name: "Best Friend 💕", avatar: "bestie.png" });

        // Beat 1: Opening text
        d.beat("opening", b => {
            b.wait("1s");
            b.receive("Best Friend 💕", "Hey! Look what I found!");
        });

        // Beat 2: Receive an image with caption
        d.beat("image-shared", b => {
            b.receiveImage("Best Friend 💕", "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600", {
                caption: "Sunset from the beach 🏖️",
                height: 450  // Custom height
            });
        });

        // Beat 3: React with text
        d.beat("react-text", b => {
            b.send("OMG that's beautiful! 😍");
        });

        // Beat 4: Send a GIF reaction
        d.beat("gif-reaction", b => {
            b.sendGif("https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif");
        });

        // Beat 5: Receive a video
        d.beat("video-shared", b => {
            b.receiveVideo("Best Friend 💕", "https://example.com/beach-waves.mp4", 15, {
                thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                caption: "Watch this wave! 🌊"
            });
        });

        // Beat 6: Voice note response
        d.beat("voice-response", b => {
            b.typing("Best Friend 💕").for("2s");
            b.receiveVoice("Best Friend 💕", 8);  // 8 second voice note
        });

        // Beat 7: Reply with voice
        d.beat("voice-reply", b => {
            b.sendVoice(5);  // 5 second voice note
        });

        // Beat 8: More conversation
        d.beat("final-exchange", b => {
            b.receive("Best Friend 💕", "That GIF is perfect 😂");
            b.send("Haha yeah! Miss you! 💕");
        });

        // Beat 9: Final image
        d.beat("closing", b => {
            b.receiveImage("Best Friend 💕", "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600");
            b.wait("2s");
        });
    });
});

export { mediaShowcaseSceneIR as default };
