/**
 * Cinematic Camera Showcase DSL
 * 
 * Demonstrates all camera features:
 * - Camera primitives (hold, follow, pushIn, pullOut, snap, shake)
 * - Preset-driven behavior
 * - Composite moves
 * - Director-like camera orchestration
 */

import { episode } from "../author/episode-builder";

export const cinematicCameraShowcase = episode(
    "cinematic-camera-showcase",
    (ep) => {
        ep.config({ fps: 30, title: "Cinematic Camera Showcase" });

        // Define the phone device
        ep.device("phone", "iphone16", (d) => {
            // Set up WhatsApp conversation
            d.app("whatsapp");
            d.conversation("dm_ex", { name: "Ex 💔", type: "dm" });

            // ===================================================================
            // BEAT 1: ESTABLISHING SHOT
            // Camera holds on empty chat
            // ===================================================================
            d.beat("establishing", (b) => {
                b.wait("2s");
            });

            // ===================================================================
            // BEAT 2: TENSION BUILDS
            // First message arrives, camera follows with high lag
            // ===================================================================
            d.beat("tension-builds", (b) => {
                b.receive("Ex 💔", "We need to talk.");
                b.wait("1.5s");
            });

            // ===================================================================
            // BEAT 3: ANTICIPATION
            // Typing indicator, camera subtly pushes in
            // ===================================================================
            d.beat("anticipation", (b) => {
                b.typing("Ex 💔").for("3s");
            });

            // ===================================================================
            // BEAT 4: THE REVEAL
            // Long message arrives, camera snaps to it
            // ===================================================================
            d.beat("reveal", (b) => {
                b.receive("Ex 💔", "I've been thinking about us a lot lately... and I don't think this is working anymore.");
                b.wait("1s");
            });

            // ===================================================================
            // BEAT 5: REACTION
            // User reads, camera pulls out for context
            // ===================================================================
            d.beat("reaction", (b) => {
                b.wait("2s");
            });

            // ===================================================================
            // BEAT 6: ESCALATION
            // Rapid exchange, camera gets tighter
            // ===================================================================
            d.beat("escalation", (b) => {
                b.receive("Ex 💔", "Hello?");
                b.wait("0.8s");
                b.send("What do you mean?");
                b.wait("0.5s");
                b.receive("Ex 💔", "You know exactly what I mean.");
                b.wait("0.3s");
                b.send("I don't understand...");
                b.wait("0.5s");
            });

            // ===================================================================
            // BEAT 7: DRAMATIC MOMENT
            // Shake for emphasis on dramatic message
            // ===================================================================
            d.beat("dramatic", (b) => {
                b.receive("Ex 💔", "It's over.");
                b.wait("2s");
            });

            // ===================================================================
            // BEAT 8: CALM AFTER STORM
            // Camera slowly resets to neutral
            // ===================================================================
            d.beat("aftermath", (b) => {
                b.send("...");
                b.wait("3s");
            });
        });

        // ===================================================================
        // CAMERA TRACK
        // Orchestrated camera movements synced to story beats
        // ===================================================================
        ep.camera((c) => {
            // Beat 1: Hold on empty chat
            c.at("0s").hold("2s");

            // Beat 2: Follow new message with high lag
            c.at("2s").follow(0.5, 0.85, { lag: "high" });

            // Beat 3: Subtle push during typing
            c.at("3.5s").pushIn(0.015, { originY: 0.95, duration: "2s" });

            // Beat 4: Snap to reveal message
            c.at("6.5s").snap(0.5, 0.8);

            // Beat 5: Pull out for context
            c.at("7.5s").pullOut(0.08, { duration: "1.5s" });

            // Beat 6: Escalation - tighter and faster
            c.at("9.5s").pushIn(0.05, { duration: "0.3s" });
            c.at("10.3s").pushIn(0.03, { duration: "0.2s" });
            c.at("10.8s").pushIn(0.03, { duration: "0.2s" });

            // Beat 7: Shake on dramatic moment
            c.at("12s").shake("phone", { intensity: 8, frequency: 15, decay: 0.6, duration: "0.5s" });

            // Beat 8: Smooth reset
            c.at("14s").reset({ duration: "2s", easing: "cinematic" });
        });
    },
    { fps: 30, title: "Cinematic Camera Showcase" }
);

// Export for use
export default cinematicCameraShowcase;
