/**
 * WhatsApp Production Demo
 * 
 * Showcases all WhatsApp features: images, videos, GIFs, voice notes,
 * typing indicators, and read receipts.
 * 
 * DSL version of whatsapp-production-demo.json
 */

import { episode, iPhone } from "@tokovo/dsl";

export const whatsappProduction = episode("whatsapp-production")
    .meta({
        title: "WhatsApp Production Demo",
        description: "Showcases all new WhatsApp features",
        fps: 30,
    })
    .device("main_phone", {
        profile: iPhone,
        isLocked: false,
        foregroundAppId: "app_whatsapp",
    })
    .app("app_whatsapp", {
        conversationId: "conv_bestie",
        conversationName: "Best Friend 💕",
    })
    .initialMessages("conv_bestie", [
        { from: "Best Friend 💕", text: "Hey! Look at this sunset 🌅", status: "read" },
    ])

    // Beat 1: Image message
    .beat("image-message", (b) => {
        b.wait("1s");
        b.receiveImage("Best Friend 💕",
            "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600",
            { caption: "From the beach today! 🏖️" }
        );
    })

    // Beat 2: Typing and reply
    .beat("typing-reply", (b) => {
        b.wait("2s");
        b.typing("me").for("2s");
        b.send("OMG that's beautiful! 😍");
    })

    // Beat 3: Video message
    .beat("video-message", (b) => {
        b.wait("2s");
        b.receiveVideo("Best Friend 💕",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
            { duration: 15, caption: "Watch this wave 🌊" }
        );
    })

    // Beat 4: GIF response
    .beat("gif-response", (b) => {
        b.wait("3s");
        b.sendGif("https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif");
    })

    // Beat 5: Voice message
    .beat("voice-message", (b) => {
        b.wait("3s");
        b.typing("Best Friend 💕").for("3s");
        b.receiveVoice("Best Friend 💕", { duration: 8 });
    })

    // Beat 6: Read receipt and reactions
    .beat("reactions", (b) => {
        b.wait("4s");
        b.receive("Best Friend 💕", "That GIF is perfect 😂");
        b.wait("3s");
        b.receiveImage("Best Friend 💕",
            "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600"
        );
    })

    .build();

export default whatsappProduction;
