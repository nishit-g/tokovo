/**
 * Ultimate Capabilities Showcase Episode
 * 
 * This episode demonstrates all key capabilities of Tokovo:
 * - Messaging (receive, send, typing)
 * - Camera (zoom, focus)
 * - Wait timing
 * 
 * Uses the CORRECT DSL API pattern from enterprise-demo.episode.ts
 * 
 * @see docs-v2/03-DSL-REFERENCE.md
 */

import { episode } from "@tokovo/dsl";
import type { SceneIR } from "@tokovo/ir";

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

export const ultimateShowcaseEpisode: SceneIR = episode("ultimate-showcase", ep => {
    ep.config({
        fps: 30,
        title: "Ultimate Tokovo Showcase"
    });

    // =========================================================================
    // DEVICE SETUP
    // =========================================================================

    ep.device("Phone", "iphone16", d => {
        d.app("app_whatsapp");

        // Conversations
        d.conversation("dm_sarah", { name: "Sarah ❤️", avatar: "" });
        d.conversation("dm_boss", { name: "Boss 👔", avatar: "" });
        d.conversation("family_group", { name: "Family 👨‍👩‍👧", avatar: "" });

        // =====================================================================
        // BEAT 1: Opening - Sarah messages first
        // =====================================================================

        d.beat("opening", b => {
            b.wait("500ms");
            b.receive("Sarah ❤️", "Hey baby! I've been thinking about you all day 💕");
        });

        // =====================================================================
        // BEAT 2: User replies with typing
        // =====================================================================

        d.beat("user-reply", b => {
            b.wait("800ms");
            b.typing("me").for("1.5s");
            b.send("Aww that's so sweet! I was just thinking about you too 😊");
        });

        // =====================================================================
        // BEAT 3: Sarah typing and responding
        // =====================================================================

        d.beat("sarah-responds", b => {
            b.wait("600ms");
            b.typing("Sarah ❤️").for("2s");
            b.receive("Sarah ❤️", "Look at this beautiful sunset! Wish you were here 🌅");
        });

        // =====================================================================
        // BEAT 4: Camera focus on message
        // =====================================================================

        d.beat("camera-focus", b => {
            b.wait("500ms");
            b.camera(c => {
                c.focus("lastMessage", { duration: "0.5s", preset: "subtle" });
            });
            b.wait("1s");
        });

        // =====================================================================
        // BEAT 5: Romantic exchange
        // =====================================================================

        d.beat("romantic-exchange", b => {
            b.wait("500ms");
            b.typing("me").for("1s");
            b.send("Wow, that's gorgeous! 😍");

            b.wait("800ms");
            b.typing("Sarah ❤️").for("1.5s");
            b.receive("Sarah ❤️", "I have something important to tell you...");
        });

        // =====================================================================
        // BEAT 6: Dramatic pause with camera
        // =====================================================================

        d.beat("dramatic-pause", b => {
            b.wait("1s");
            b.camera(c => {
                c.focus("lastMessage", { duration: "1s", preset: "dramatic" });
            });
            b.wait("2s");
        });

        // =====================================================================
        // BEAT 7: The reveal
        // =====================================================================

        d.beat("reveal", b => {
            b.typing("Sarah ❤️").for("3s");
            b.receive("Sarah ❤️", "I got the job offer! We can finally move in together! 🎉🏠");
        });

        // =====================================================================
        // BEAT 8: Excited response
        // =====================================================================

        d.beat("celebration", b => {
            b.wait("500ms");
            b.typing("me").for("0.8s");
            b.send("OMG THAT'S AMAZING!! 🎊🎊🎊 I'M SO PROUD OF YOU!!");

            b.wait("800ms");
            b.typing("Sarah ❤️").for("1s");
            b.receive("Sarah ❤️", "I love you so much! 💕💕💕");
        });

        // =====================================================================
        // BEAT 9: Final message and camera reset
        // =====================================================================

        d.beat("finale", b => {
            b.wait("500ms");
            b.typing("me").for("0.8s");
            b.send("I love you too! Let's celebrate tonight! 🥂");

            b.wait("1s");
            b.camera(c => {
                c.focus("lastMessage", { duration: "0.5s", preset: "subtle" });
            });
            b.wait("2s");
        });
    });
});

// =============================================================================
// EXPORTS
// =============================================================================

export default ultimateShowcaseEpisode;

// Metadata for composition
export const ultimateShowcaseConfig = {
    id: "UltimateCapabilitiesShowcase",
    durationInFrames: 900, // 30 seconds at 30fps
    fps: 30,
    width: 1080,
    height: 1920
};
