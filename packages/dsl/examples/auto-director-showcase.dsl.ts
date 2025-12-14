/**
 * ============================================================================
 * PRODUCTION DSL SHOWCASE: AUTOMATIC DIRECTORLITE
 * ============================================================================
 * 
 * This showcase demonstrates the AUTOMATIC camera system where DirectorLite
 * controls all camera movement based on signals (messages, typing, etc.).
 * 
 * NO MANUAL CAMERA DSL CALLS - the camera is 100% reactive.
 * 
 * FEATURES DEMONSTRATED:
 * - Automatic message following (FocusAnchor → lastMessage)
 * - Typing anticipation (FocusAnchor → inputArea)
 * - Signal-based camera (NewMessage, TypingStarted, TypingEnded)
 * - Anchor resolution at runtime
 * - Smooth operator follow with punchGlide preset
 * 
 * CAMERA PERSONALITY: "A careful human operator who reacts, but does not anticipate."
 * 
 * DURATION: ~45 seconds (1350 frames @ 30fps)
 * ============================================================================
 */

import { episode } from "@tokovo/dsl";

export const autoDirectorShowcase = episode("auto-director-showcase", ep => {
    ep.config({
        fps: 30,
        title: "DirectorLite Automatic Camera Demo",
        // DirectorLite is ENABLED by default - camera is fully automatic
    });

    ep.device("phone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_viral", { name: "Drama 👑" });

        // =====================================================================
        // ACT 1: THE SETUP (0s - 12s)
        // Casual conversation - camera follows messages naturally
        // Director uses: message preset (scale: 1.08, dur: 22f)
        // =====================================================================

        d.beat("act1-setup", { function: "setup", tempo: "slow" }, b => {
            // Establish scene - no camera movement yet
            b.wait("1s");

            // First message - DirectorLite triggers FocusAnchor → lastMessage
            b.receive("Drama 👑", "hey girl, you free tonight?");
            b.wait("1.2s");

            // Reply - camera follows to our message
            b.send("maybe, what's up?");
            b.wait("1s");

            // Another message - camera follows back
            b.receive("Drama 👑", "need to talk to you about something 😬");
            b.wait("1.5s");

            // Short typing - builds curiosity
            // Director triggers: FocusAnchor → inputArea (subtle preset)
            b.typing("Drama 👑").for("0.8s");

            // Cryptic follow-up
            b.receive("Drama 👑", "it's about jake...");
            b.wait("1.2s");

            // Our typing - input area focus
            b.typing("You").for("0.6s");
            b.send("wait what about jake???");
            b.wait("1s");
        });

        // =====================================================================
        // ACT 2: THE BUILDUP (12s - 24s)
        // Tension rises - longer typing, more dramatic messages
        // Director uses: subtle preset for anticipation, message preset for reveals
        // =====================================================================

        d.beat("act2-buildup", { function: "buildup", tempo: "medium" }, b => {
            // Long typing - anticipation builds
            // Director holds on inputArea with subtle preset
            b.typing("Drama 👑").for("3s");

            // Partial reveal - camera snaps to message
            b.receive("Drama 👑", "so... remember when i said he was acting weird?");
            b.wait("1.5s");

            b.send("yeah...");
            b.wait("0.8s");

            // More typing - tension continues
            b.typing("Drama 👑").for("2s");

            b.receive("Drama 👑", "i found something on his phone");
            b.wait("1.2s");

            // Quick exchange - rapid message following
            b.send("OMG WHAT");
            b.wait("0.6s");

            b.receive("Drama 👑", "he's been texting someone");
            b.wait("0.8s");

            b.send("WHO???");
            b.wait("0.6s");

            // Dramatic pause with typing
            b.typing("Drama 👑").for("2.5s");
        });

        // =====================================================================
        // ACT 3: THE CLIMAX (24s - 36s)
        // The big reveal - Director should use impact/punchGlide
        // Messages are emotional, camera reacts with intensity
        // =====================================================================

        d.beat("act3-climax", { function: "climax", tempo: "fast", emotionalPeak: true }, b => {
            // THE BIG REVEAL
            // Director should trigger: impact preset (scale: 1.35, shake: 6)
            b.receive("Drama 👑", "IT'S MY BEST FRIEND SARAH!!!! 😭😭😭");
            b.wait("2s");

            // Shock reaction
            b.send("NO. WAY.");
            b.wait("1s");

            b.receive("Drama 👑", "i have screenshots");
            b.wait("0.8s");

            b.send("send them RIGHT NOW");
            b.wait("0.6s");

            // More typing - frantic
            b.typing("Drama 👑").for("1.5s");

            b.receive("Drama 👑", "they've been meeting up for 3 MONTHS");
            b.wait("1.5s");

            // Emotional reaction
            b.send("omg babe im so sorry 💔");
            b.wait("1s");

            b.receive("Drama 👑", "what do i do??? 😭");
            b.wait("1.5s");

            // Quick supportive messages
            b.send("im coming over");
            b.wait("0.5s");

            b.send("dont do anything yet");
            b.wait("0.5s");

            b.send("we need to talk in person 💕");
            b.wait("1s");
        });

        // =====================================================================
        // ACT 4: THE RESOLUTION (36s - 45s)
        // Calming down - camera should use reset, smaller movements
        // Director naturally returns to neutral framing
        // =====================================================================

        d.beat("act4-resolution", { function: "resolution", tempo: "slow", release: true }, b => {
            // Typing - she's calming down
            b.typing("Drama 👑").for("2s");

            b.receive("Drama 👑", "ok... thank you 😢");
            b.wait("1.5s");

            b.send("always here for you ❤️");
            b.wait("1.2s");

            b.receive("Drama 👑", "im so lucky to have you as a friend");
            b.wait("1.5s");

            b.send("that's what besties are for 💕");
            b.wait("1.5s");

            // Final beat
            b.receive("Drama 👑", "see you soon 💛");
            b.wait("1s");

            b.send("be there in 20 🚗");
            b.wait("1.5s");
        });
    });

    // =========================================================================
    // NO CAMERA SECTION!
    // This showcase is 100% automatic DirectorLite.
    // The camera is controlled entirely by signals → rules → FocusAnchor effects.
    // =========================================================================

    // ep.camera(c => {
    //     // INTENTIONALLY EMPTY
    //     // DirectorLite handles all camera movement automatically
    // });
});

export default autoDirectorShowcase;
