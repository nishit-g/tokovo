/**
 * WhatsApp Toxic Ex Drama Episode
 * 
 * Showcases dramatic features:
 * - Missed calls
 * - Deleted messages
 * - Voice notes
 * - Screenshot alerts
 * - Rapid-fire emotional messages
 */

import { episode as createEpisode } from "../src/author";
import { SceneIR } from "@tokovo/ir";

export const toxicExSceneIR: SceneIR = createEpisode("toxic-ex-drama", ep => {
    ep.config({ fps: 30, title: "Toxic Ex Drama" });

    ep.device("MyPhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_toxic", { name: "Toxic Ex 🚩", avatar: "" });

        // Initial messages (already in conversation)
        // These would be part of initialWorld in full implementation

        // Beat 1: Ominous silence then voice note
        d.beat("voice-note-arrives", b => {
            b.wait("2s");
            b.typing("Toxic Ex 🚩").for("1s");
            b.receiveVoice("Toxic Ex 🚩", 45); // 45 second voice note
        });

        // Beat 2: Screenshot alert
        d.beat("screenshot-alert", b => {
            b.wait("2s");
            b.receive("Toxic Ex 🚩", "Took a screenshot! 📸");
        });

        // Beat 3: My response (tries to de-escalate)
        d.beat("attempted-response", b => {
            b.wait("1s");
            b.send("Can we just talk normally?");
            b.wait("0.5s");
            b.send("I don't understand why you're upset");
        });

        // Beat 4: Toxic response storm
        d.beat("message-storm", b => {
            b.typing("Toxic Ex 🚩").for("0.5s");
            b.receive("Toxic Ex 🚩", "YOU DON'T UNDERSTAND?!");
            b.wait("0.3s");
            b.receive("Toxic Ex 🚩", "After everything I did for us?");
            b.wait("0.3s");
            b.receive("Toxic Ex 🚩", "This is exactly what I'm talking about");
        });

        // Beat 5: Frustrated escalation
        d.beat("escalation", b => {
            b.wait("1s");
            b.typing("Toxic Ex 🚩").for("2s");
            // Long message
            b.receive("Toxic Ex 🚩", "I can't believe you would do this to me. I thought we had something special but clearly I was just fooling myself. You never really cared.");
        });

        // Beat 6: My final response
        d.beat("final-response", b => {
            b.wait("1.5s");
            b.send("I think we need some space right now");
            b.wait("0.5s");
            b.send("Let's talk when things calm down");
        });

        // Beat 7: Ominous typing that never sends
        d.beat("ominous-typing", b => {
            b.wait("1s");
            b.typing("Toxic Ex 🚩").for("3s");
            // No message comes... tension
            b.wait("2s");
        });
    });
});

export { toxicExSceneIR as default };
