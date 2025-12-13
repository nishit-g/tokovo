/**
 * Breakup Drama Episode
 * 
 * This exports a pre-compiled Episode JSON for use in the video-runner.
 */

import { episode as createEpisode } from "../src/author";
import { SceneIR } from "@tokovo/ir";

/**
 * The DSL definition for breakup drama
 */
export const breakupDramaSceneIR: SceneIR = createEpisode("breakup-drama-01", ep => {
    ep.config({ fps: 30, title: "The Breakup Drama" });

    ep.device("AlicePhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_bob", { name: "Bob", avatar: "bob.png" });

        // Beat 1: Silence
        d.beat("silence", b => {
            b.wait("2s");
        });

        // Beat 2: Typing tension
        d.beat("typing-tension", b => {
            b.concurrent([
                t => t.typing("Bob").for("1.5s"),
                t => t.wait("0.7s").receive("Bob", "We need to talk.")
            ]);
            b.wait("0.5s");
        });

        // Beat 3: The message
        d.beat("aftermath", b => {
            const msg = b.receive("Bob", "I'm sorry. It's over.");
            b.wait("1.2s");
            b.read(msg);
            b.wait("0.5s");
        });

        // Beat 4: Panic
        d.beat("panic", b => {
            b.send("Wait, what?");
            b.wait("0.8s");
            b.send("Can we talk about this?");
            b.wait("1s");
        });

        // Beat 5: No response
        d.beat("silence-after", b => {
            b.wait("2s");
            b.typing("Bob").for("2s");
            // No message comes...
            b.wait("1s");
        });
    });
});

export { breakupDramaSceneIR as default };
