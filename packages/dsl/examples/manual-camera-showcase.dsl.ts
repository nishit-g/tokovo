/**
 * ============================================================================
 * PRODUCTION DSL SHOWCASE: MANUAL CAMERA CONTROL
 * ============================================================================
 * 
 * This showcase demonstrates MANUAL camera control using the new semantic
 * anchor-based DSL. Every camera movement is explicitly authored.
 * 
 * DirectorLite is DISABLED - all camera is controlled via DSL:
 * - camera.anchorFocus() - one-time focus on anchor
 * - camera.anchorTrack() - continuous tracking with smoothing
 * - camera.punchGlide() - punch + glide combo
 * - camera.hold() - let viewer read
 * 
 * FEATURES DEMONSTRATED:
 * - All v1 presets (message, subtle, impact, snap, operatorFollow, punchGlide, interrupt, reset)
 * - Anchor tracking with smoothing
 * - Manual timing of camera moves
 * - Punch + glide webseries signature
 * - Camera holds for readability
 * 
 * CAMERA PERSONALITY: "A seasoned cinematographer with full creative control."
 * 
 * DURATION: ~50 seconds (1500 frames @ 30fps)
 * ============================================================================
 */

import { episode } from "@tokovo/dsl";
import { camera } from "@tokovo/dsl";

export const manualCameraShowcase = episode("manual-camera-showcase", ep => {
    ep.config({
        fps: 30,
        title: "Manual Camera DSL Demo",
        directorEnabled: false,  // DISABLE DirectorLite - we control the camera
    });

    ep.device("phone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_bff", { name: "BFF 💎" });

        // =====================================================================
        // SCENE 1: ESTABLISHING SHOT (0s - 5s)
        // Use 'establish' preset - wide shot to set the scene
        // =====================================================================

        d.beat("scene1-establish", { function: "setup" }, b => {
            b.wait("2s");
            // Scene is established - viewer sees the chat
        });

        // =====================================================================
        // SCENE 2: CASUAL EXCHANGE (5s - 15s)
        // Use 'message' preset for standard following
        // =====================================================================

        d.beat("scene2-casual", b => {
            b.receive("BFF 💎", "guess what just happened! 🤩");
            b.wait("1.5s");

            b.send("what?? tell me everything!!");
            b.wait("1.2s");

            b.receive("BFF 💎", "remember that guy from the party?");
            b.wait("1s");

            b.send("the tall one with the glasses? 👀");
            b.wait("1.2s");

            b.receive("BFF 💎", "YES!! him!!");
            b.wait("1s");

            // Typing anticipation
            b.typing("BFF 💎").for("2s");

            b.receive("BFF 💎", "he asked for my number!!!");
            b.wait("1.5s");
        });

        // =====================================================================
        // SCENE 3: EXCITEMENT BUILDS (15s - 25s)
        // Use 'snap' for quick reactions, 'impact' for big moments
        // =====================================================================

        d.beat("scene3-excitement", { tempo: "fast" }, b => {
            b.send("NO WAY!!! 🎉🎉🎉");
            b.wait("0.8s");

            b.receive("BFF 💎", "I KNOW RIGHT");
            b.wait("0.6s");

            b.send("did you give it to him?!");
            b.wait("1s");

            // Dramatic pause
            b.typing("BFF 💎").for("2.5s");

            // THE REVEAL
            b.receive("BFF 💎", "we've been texting all day!! 💕");
            b.wait("2s");

            // Quick excited exchange
            b.send("SCREAMING");
            b.wait("0.5s");

            b.send("what did he say??");
            b.wait("0.8s");

            b.receive("BFF 💎", "he wants to take me to dinner 🍝");
            b.wait("1.5s");
        });

        // =====================================================================
        // SCENE 4: THE WEBSERIES MOMENT (25s - 35s)
        // Use 'punchGlide' - the signature webseries move
        // Camera punches in fast, then glides with the content
        // =====================================================================

        d.beat("scene4-webseries", { function: "climax", emotionalPeak: true }, b => {
            b.send("OMG WHEN??? WHERE???");
            b.wait("1s");

            b.typing("BFF 💎").for("1.5s");

            // THE BIG MOMENT - perfect for punchGlide
            b.receive("BFF 💎", "TOMORROW NIGHT!! at that fancy italian place downtown 🍷✨");
            b.wait("2.5s");

            b.send("you're gonna look SO good");
            b.wait("1s");

            b.receive("BFF 💎", "i have nothing to wear 😩");
            b.wait("1.2s");

            b.send("shopping spree TONIGHT");
            b.wait("0.8s");

            b.send("i know the perfect dress for you 💃");
            b.wait("1.5s");
        });

        // =====================================================================
        // SCENE 5: RESOLUTION (35s - 45s)
        // Use 'operatorFollow' for smooth tracking, then 'reset'
        // =====================================================================

        d.beat("scene5-resolution", { function: "resolution", release: true }, b => {
            b.receive("BFF 💎", "you're the best friend ever 😭💕");
            b.wait("1.5s");

            b.send("always got your back babe ❤️");
            b.wait("1.2s");

            b.receive("BFF 💎", "mall at 6?");
            b.wait("1s");

            b.send("see you then! 🛍️");
            b.wait("1.5s");

            b.receive("BFF 💎", "love you!!! 💎");
            b.wait("1.5s");

            b.send("love you more!! 💕💕💕");
            b.wait("2s");
        });
    });

    // =========================================================================
    // MANUAL CAMERA CONTROL
    // Every camera move is explicitly authored using anchor-based DSL
    // =========================================================================

    ep.timeline(t => {
        // -----------------------------------------------------------------
        // SCENE 1: ESTABLISHING (0s - 5s)
        // Use 'establish' preset - pull back to show context
        // -----------------------------------------------------------------

        // Establish the scene
        t.push(camera.anchorFocus(0, "device", "establish"));
        t.push(camera.hold(30, 60));  // Hold for 2 seconds

        // -----------------------------------------------------------------
        // SCENE 2: CASUAL EXCHANGE (5s - 15s)
        // Use 'message' preset for each message
        // -----------------------------------------------------------------

        // "guess what just happened!"
        t.push(camera.anchorFocus(150, "lastMessage", "message"));

        // "what?? tell me everything!!"
        t.push(camera.anchorFocus(195, "lastMessage", "message"));

        // "remember that guy from the party?"
        t.push(camera.anchorFocus(231, "lastMessage", "message"));

        // "the tall one with the glasses?"
        t.push(camera.anchorFocus(261, "lastMessage", "message"));

        // "YES!! him!!"
        t.push(camera.anchorFocus(297, "lastMessage", "snap"));  // Quick snap for excitement

        // Typing anticipation - focus on input area with subtle
        t.push(camera.anchorFocus(327, "inputArea", "subtle"));

        // "he asked for my number!!!"
        t.push(camera.anchorFocus(387, "lastMessage", "message"));
        t.push(camera.hold(409, 30));  // Let viewer read

        // -----------------------------------------------------------------
        // SCENE 3: EXCITEMENT BUILDS (15s - 25s)
        // Use 'snap' for quick reactions, 'impact' for reveals
        // -----------------------------------------------------------------

        // "NO WAY!!!" - snap (fast reaction)
        t.push(camera.anchorFocus(450, "lastMessage", "snap", 2));  // With shake!

        // "I KNOW RIGHT" - quick message
        t.push(camera.anchorFocus(474, "lastMessage", "snap"));

        // "did you give it to him?!"
        t.push(camera.anchorFocus(492, "lastMessage", "message"));

        // Dramatic typing pause - subtle focus on input
        t.push(camera.anchorFocus(522, "inputArea", "subtle"));

        // "we've been texting all day!!" - THE REVEAL
        // Use IMPACT preset - big moment!
        t.push(camera.anchorFocus(597, "lastMessage", "impact", 5));
        t.push(camera.hold(611, 45));  // Let it sink in

        // Quick excited exchange - rapid snaps
        t.push(camera.anchorFocus(660, "lastMessage", "snap"));  // "SCREAMING"
        t.push(camera.anchorFocus(675, "lastMessage", "snap"));  // "what did he say??"

        // "he wants to take me to dinner" - another impact
        t.push(camera.anchorFocus(699, "lastMessage", "impact", 3));

        // -----------------------------------------------------------------
        // SCENE 4: THE WEBSERIES MOMENT (25s - 35s)
        // Use 'punchGlide' - the signature move!
        // -----------------------------------------------------------------

        // "OMG WHEN??? WHERE???"
        t.push(camera.anchorFocus(750, "lastMessage", "snap", 2));

        // Typing anticipation
        t.push(camera.anchorFocus(780, "inputArea", "subtle"));

        // THE BIG MOMENT - PUNCH + GLIDE!
        // This is the webseries signature: fast zoom-in, then smooth follow
        t.push(...camera.punchGlide(825, "lastMessage"));
        t.push(camera.hold(865, 45));  // Hold for impact

        // "you're gonna look SO good"
        t.push(camera.anchorFocus(915, "lastMessage", "message"));

        // "i have nothing to wear" - slight pullback/reset
        t.push(camera.anchorFocus(945, "lastMessage", "message"));

        // "shopping spree TONIGHT" - snap back
        t.push(camera.anchorFocus(981, "lastMessage", "snap"));

        // "i know the perfect dress" - operator follow (tracking)
        t.push(camera.anchorTrack(1005, "lastMessage", 40, 0.18, "operatorFollow"));

        // -----------------------------------------------------------------
        // SCENE 5: RESOLUTION (35s - 45s)
        // Calm down with 'operatorFollow' tracking, end with 'reset'
        // -----------------------------------------------------------------

        // "you're the best friend ever" - smooth tracking
        t.push(camera.anchorTrack(1050, "lastMessage", 35, 0.18, "operatorFollow"));

        // "always got your back babe"
        t.push(camera.anchorFocus(1095, "lastMessage", "message"));

        // "mall at 6?"
        t.push(camera.anchorFocus(1131, "lastMessage", "message"));

        // "see you then!"
        t.push(camera.anchorFocus(1161, "lastMessage", "snap"));

        // "love you!!!"
        t.push(camera.anchorFocus(1206, "lastMessage", "message"));

        // Final message with hold
        t.push(camera.anchorFocus(1251, "lastMessage", "message"));
        t.push(camera.hold(1273, 45));

        // Reset to neutral at the end
        t.push(camera.anchorFocus(1320, "device", "reset"));
    });
});

export default manualCameraShowcase;
