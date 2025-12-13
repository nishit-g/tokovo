/**
 * WhatsApp Production Demo Episode
 * 
 * Showcases all WhatsApp production features:
 * - Image messages with captions
 * - Video messages with thumbnails
 * - GIF messages
 * - Voice notes
 * - Typing indicators
 * - Read receipts
 */

import { episode as createEpisode } from "../src/author";
import { SceneIR } from "@tokovo/ir";

export const productionDemoSceneIR: SceneIR = createEpisode("whatsapp-production", ep => {
    ep.config({ fps: 30, title: "WhatsApp Production Demo" });

    ep.device("MyPhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_bestie", { name: "Best Friend 💕", avatar: "" });

        // Initial message already in conversation
        // "Hey! Look at this sunset 🌅"

        // Beat 1: Friend sends beautiful sunset photo
        d.beat("sunset-photo", b => {
            b.wait("1s");
            b.receiveImage("Best Friend 💕",
                "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600",
                { caption: "From the beach today! 🏖️" }
            );
        });

        // Beat 2: Typing then response
        d.beat("my-response", b => {
            b.wait("2s");
            b.send("Omg that's gorgeous! 😍");
            b.wait("0.5s");
            b.send("I'm so jealous rn");
        });

        // Beat 3: Friend sends video
        d.beat("video-share", b => {
            b.wait("1.5s");
            b.typing("Best Friend 💕").for("1s");
            b.receiveVideo("Best Friend 💕",
                "https://example.com/beach-waves.mp4",
                15,
                {
                    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                    caption: "The waves are insane! 🌊"
                }
            );
        });

        // Beat 4: Send GIF reaction
        d.beat("gif-reaction", b => {
            b.wait("2s");
            b.sendGif("https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif");
            b.wait("0.3s");
            b.send("Living my best life vicariously through you 😂");
        });

        // Beat 5: Voice note exchange
        d.beat("voice-notes", b => {
            b.wait("1.5s");
            b.receiveVoice("Best Friend 💕", 8);
            b.wait("2s");
            b.sendVoice(5);
        });

        // Beat 6: More photos
        d.beat("more-photos", b => {
            b.wait("1.5s");
            b.receiveImage("Best Friend 💕",
                "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600",
                { caption: "And dinner 🍝" }
            );
            b.wait("1s");
            b.receiveImage("Best Friend 💕",
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"
            );
        });

        // Beat 7: Final exchange
        d.beat("final-exchange", b => {
            b.wait("1.5s");
            b.send("Ok stop making me hungry too 😭");
            b.wait("0.5s");
            b.receive("Best Friend 💕", "Haha! Come visit soon! ✈️");
            b.wait("0.5s");
            b.send("Definitely planning it! 🙌");
        });
    });
});

export { productionDemoSceneIR as default };
