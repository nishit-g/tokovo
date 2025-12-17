/**
 * Enterprise Demo Episode
 * 
 * PROPER IMPLEMENTATION using the canonical DSL:
 * - episode() with d.beat() / b.send() / b.receive()
 * - Uses device-keyboard for typing
 * - Zero inline types or helper functions
 * 
 * @see docs/FUCKING_MESS.md
 */

import { episode } from "@tokovo/dsl";
import type { SceneIR } from "@tokovo/ir";

// =============================================================================
// EPISODE DEFINITION (Pure DSL - No Manual Events)
// =============================================================================

export const enterpriseDemo: SceneIR = episode("enterprise-demo", ep => {
    ep.config({ fps: 30, title: "Enterprise Demo - Dinner Date" });

    ep.device("MainPhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_sarah", { name: "Sarah ❤️", avatar: "" });

        // =====================================================================
        // ACT 1: Opening - Sarah initiates
        // =====================================================================
        d.beat("opening", b => {
            b.wait("1s");
            b.receive("Sarah ❤️", "Hey! Are you free tonight?");
        });

        // =====================================================================
        // ACT 2: Me replying (with keyboard)
        // =====================================================================
        d.beat("reply", b => {
            b.wait("1s");
            b.typing("me").for("2s");  // Shows keyboard + typing animation
            b.send("Yeah, what's up?");
        });

        // =====================================================================
        // ACT 3: Sarah suggests dinner
        // =====================================================================
        d.beat("dinner-suggestion", b => {
            b.wait("0.8s");
            b.typing("Sarah ❤️").for("2s");
            b.receive("Sarah ❤️", "Want to grab dinner? 🍝");
        });

        // =====================================================================
        // ACT 4: Quick back and forth
        // =====================================================================
        d.beat("quick-exchange", b => {
            b.wait("0.5s");
            b.typing("me").for("1.5s");
            b.send("Sure! What are you in the mood for?");

            b.wait("1s");
            b.typing("Sarah ❤️").for("2s");
            b.receive("Sarah ❤️", "How about that new Italian place? 🇮🇹");
        });

        // =====================================================================
        // ACT 5: Confirmation with emojis
        // =====================================================================
        d.beat("confirmation", b => {
            b.wait("0.8s");
            b.typing("me").for("1.5s");
            b.send("Perfect! See you at 7? 🥂");

            b.wait("1s");
            b.typing("Sarah ❤️").for("1s");
            b.receive("Sarah ❤️", "It's a date! 💕");
        });

        // =====================================================================
        // ACT 6: Camera focus on final message
        // =====================================================================
        d.beat("finale", b => {
            b.wait("1s");
            b.camera(c => {
                c.focus("lastMessage", { duration: "1s", preset: "subtle" });
            });
            b.wait("2s");
        });
    });
});

// =============================================================================
// EXPORTS
// =============================================================================

export default enterpriseDemo;
