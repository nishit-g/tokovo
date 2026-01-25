/**
 * Semantic Camera System Showcase
 *
 * DSL episode demonstrating the Semantic Anchor-Driven Camera System:
 *
 * 1. FOLLOWING MESSAGES - Camera follows new messages as they appear
 * 2. TYPING ANTICIPATION - Focus on input area during typing
 * 3. DRAMATIC ZOOM - Push in on emotional/important messages
 * 4. SNAP TO REACTION - Quick snap when reactions/hearts are sent
 * 5. RESET/PULLBACK - Return to neutral framing
 */

import { episode } from "@tokovo/dsl";

export const semanticCameraShowcase = episode(
  "semantic-camera-showcase",
  (ep) => {
    ep.config({ fps: 30, title: "Semantic Camera System Demo" });

    ep.device("phone", "iphone16", (d) => {
      d.app("app_whatsapp");
      d.conversation("dm_bestie", { name: "Bestie 💕" });

      // =====================================================================
      // SCENE 1: ESTABLISHING + FOLLOWING MESSAGES (0s - 5s)
      // Camera follows each message as it arrives
      // =====================================================================

      d.beat("establishing", (b) => {
        b.wait("1s");
      });

      d.beat("following-messages", (b) => {
        // Message 1 - camera follows
        b.receive("Bestie 💕", "omg hi!! 👋");
        b.wait("0.8s");

        // Message 2 - quick reply, camera follows right
        b.send("heyyy!! what's up?");
        b.wait("0.8s");

        // Message 3 - camera follows back left
        b.receive("Bestie 💕", "you will NOT believe what just happened 😱");
        b.wait("0.5s");
      });

      // =====================================================================
      // SCENE 2: TYPING ANTICIPATION (5s - 9s)
      // Camera focuses on input area during typing - builds tension
      // =====================================================================

      d.beat("typing-anticipation", (b) => {
        // Typing starts - focus shifts to input area (stable anchor)
        b.typing("Bestie 💕").for("2.5s");
        b.wait("0.3s");
      });

      // =====================================================================
      // SCENE 3: DRAMATIC ZOOM (9s - 13s)
      // Important message gets dramatic camera treatment
      // =====================================================================

      d.beat("dramatic-reveal", (b) => {
        // The big reveal - DRAMATIC ZOOM expected
        b.receive("Bestie 💕", "I just got the job!!! 🎉🎉🎉");
        b.wait("1.5s");

        // Excited reply
        b.send("OMG CONGRATS!!! 🥳🎊");
        b.wait("1s");
      });

      // =====================================================================
      // SCENE 4: SNAP TO REACTION (13s - 16s)
      // Quick camera snap when heart/reaction is sent
      // =====================================================================

      d.beat("reaction-snap", (b) => {
        b.receive("Bestie 💕", "I start next Monday!! So nervous 😅");
        b.wait("1s");

        // Heart reaction - SNAP expected
        b.send("❤️");
        b.wait("1s");
      });

      // =====================================================================
      // SCENE 5: RESET/PULLBACK (16s - 22s)
      // Camera returns to neutral framing
      // =====================================================================

      d.beat("reset-pullback", (b) => {
        b.receive("Bestie 💕", "lunch tomorrow to celebrate? 🍣");
        b.wait("1s");

        // Camera should reset/pullback here
        b.send("yesss!! can't wait! 💕");
        b.wait("1.5s");

        // Final beat
        b.receive("Bestie 💕", "love youuu 💛");
        b.wait("1s");
      });
    });

    // Optional manual camera events
    ep.camera((c) => {
      c.at("5s").zoom({
        scale: 1.06,
        origin: { y: 0.85 },
        duration: "1s",
        easing: "cinematic",
      });

      // SCENE 3: Dramatic zoom on big news
      c.at("9s").zoom({
        scale: 1.25,
        origin: { y: 0.8 },
        duration: "0.5s",
        easing: "ease-out",
      });
      c.at("9s").shake({ intensity: 5, duration: "0.5s" });

      // SCENE 4: Snap on reaction
      c.at("14s").zoom({
        scale: 1.15,
        origin: { y: 0.88 },
        duration: "0.25s",
        easing: "ease-out",
      });
      c.at("14s").shake({ intensity: 2, duration: "0.25s" });

      // SCENE 5: Reset to neutral
      c.at("16s").reset({ duration: "1.5s", easing: "ease-in-out" });
    });
  },
);

export default semanticCameraShowcase;
