import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";
import type { TypewriterThemeConfig } from "@tokovo/apps-typewriter";
import { KeyboardPlugin } from "@tokovo/compiler";

let order = 0;
const getOrder = () => order++;

const TERMINAL_THEME = {
  preset: "midnight",
  overrides: {
    layout: { maxRows: 14, maxCols: 48, wrap: "char", bellColsFromRight: 5 },
    paper: { rotationDeg: -0.3, vignetteOpacity: 0.2, grainOpacity: 0.12, fiberOpacity: 0.08 },
    desk: { vignetteOpacity: 0.7, highlightOpacity: 0.05 },
    audio: { volVar: 0.15, roomVol: 0.18 },
  },
} as const satisfies TypewriterThemeConfig;

export default defineEpisode({
  meta: {
    id: "mrrobot-the-hook",
    title: "Mr. Robot: The Hook",
    description: "A social engineering masterclass. Watch how easy it is to manipulate someone into giving up their credentials.",
    category: "production",
    tags: ["mrrobot", "hacker", "cybersecurity", "social-engineering", "dark"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 10800,
    apps: ["app_whatsapp", "app_typewriter"],
  },
  build: () =>
    episode("mrrobot-the-hook", {
      fps: 30,
      duration: "360s",
      title: "Mr. Robot: The Hook",
      description: "A social engineering masterclass. Watch how easy it is to manipulate someone into giving up their credentials.",
    })
      // Dark background for the entire episode
      .background({ type: "solid", color: "#0a0a0a" })
      
      // === SCENE 1: THE OBSERVER (0:00 - 1:30) ===
      // Typewriter showing terminal/hacker aesthetic
      .device("desk", "canvas", {
        app: "app_typewriter",
        installedApps: ["app_typewriter"],
        os: { time: new Date("2024-12-18T02:30:00"), battery: 94, network: "wifi" },
      })
      .track(
        "app_typewriter",
        () => new TypewriterTrackBuilder(30, "desk", getOrder, { theme: TERMINAL_THEME }),
        (tw) => {
          tw.at("0.0s").initLetter({
            to: "TARGET: Marcus Chen",
            from: "OBSERVER",
            date: "Dec 18, 2024",
            subject: "OSINT Report - Nexus Financial",
            reset: true,
            seed: 1337,
            roomTone: false,
            theme: TERMINAL_THEME,
          });

          tw.span("1.0s", "15.0s").typeText(
            [
              "/// INITIAL SURVEILLANCE REPORT",
              "Target: Marcus Chen, 34",
              "Position: Sr. IT Admin",
              "Company: Nexus Financial Corp",
              "",
              "Access Level: Domain Admin",
              "2FA: Enabled (YubiKey)",
              "Password Policy: 14 char min",
              "",
              "/// VULNERABILITY ANALYSIS",
              "- Recently divorced (3 mo)",
              "- Active on social media",
              "- Shares too much info",
              "- Uses same password since 2019",
              "",
              "/// ENTRY POINT IDENTIFIED",
              "HR Department",
              "Benefits portal update",
              "Deadline: Friday 5PM",
            ].join("\n"),
            {
              cps: 25,
              jitter: { minFrames: -1, maxFrames: 2 },
              mistakes: { rate: 0.01, max: 1 },
              pauses: { afterPunctFrames: 1, afterNewlineFrames: 2, afterSpaceFrames: 0 },
            },
          );
        },
      )
      .camera((cam) => {
        cam.at("0.0s").focus("paper", { scale: 1.02, duration: "0.4s" });
        cam.span("2.0s", "15.0s").trackCinematic("cursor", {
          scale: 1.4,
          smoothing: 0.25,
        });
      })

      // === SCENE 2: THE MESSAGE (1:30 - 3:00) ===
      // WhatsApp social engineering begins
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-18T16:15:00"),
          battery: 72,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_hr", name: "HR - Nexus", avatar: "/avatars/hr.png" },
        ],
      })
      
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_hr", getOrder),
        (wa) => {
          wa.switchTo("dm_hr", "30s");
          
          // First message - the hook
          wa.at("32s").receive("HR - Nexus", "Hi Marcus,");
          wa.at("32.5s").receive("HR - Nexus", "This is Sarah from HR.");
          wa.at("33s").receive("HR - Nexus", "We're updating our benefits portal and need you to verify your account details ASAP.");
          wa.at("34s").receive("HR - Nexus", "The deadline is today at 5 PM.");
          wa.at("35s").receive("HR - Nexus", "Click here to verify: nexus-benefits-secure.com/verify");
          
          // Pause - target is thinking
          wa.span("40s", "50s").typing("them");
          
          // Target asks a question (doubt)
          wa.at("52s").send("Hi Sarah, which benefits portal is this for?");
          
          // Wait for response
          wa.span("55s", "70s").typing("them");
          
          // Attacker responds with urgency
          wa.at("72s").receive("HR - Nexus", "It's for the 2024 health plan update, Marcus!");
          wa.at("73s").receive("HR - Nexus", "Here's the direct link:");
          wa.at("74s").receive("HR - Nexus", "nexus-benefits-secure.com/login?user=mchen");
          wa.at("75s").receive("HR - Nexus", "Just log in with your SSO credentials.");
        },
      )
      
      // === SCENE 3: THE CREDENTIALS (3:00 - 4:30) ===
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_hr", getOrder),
        (wa) => {
          wa.switchTo("dm_hr", "90s");
          
          // Target responds - about to fall for it
          wa.at("92s").send("Okay thanks Sarah, let me check...");
          
          wa.span("95s", "110s").typing("them");
          
          // Fake success message
          wa.at("112s").receive("HR - Nexus", "Perfect! Your account has been verified.");
          wa.at("113s").receive("HR - Nexus", "You're all set for the benefits update.");
          wa.at("114s").receive("HR - Nexus", "Thanks for being so prompt, Marcus! 😊");
          
          // Target responds
          wa.at("120s").send("No problem! Happy to help.");
        },
      )
      
      // === SCENE 4: THE RESULTS (4:30 - 6:00) ===
      // Back to typewriter showing the results
      .device("desk", "canvas", {
        app: "app_typewriter",
        installedApps: ["app_typewriter"],
        os: { time: new Date("2024-12-18T16:20:00"), battery: 91, network: "wifi" },
      })
      .track(
        "app_typewriter",
        () => new TypewriterTrackBuilder(30, "desk", getOrder, { theme: TERMINAL_THEME }),
        (tw) => {
          tw.at("150.0s").initLetter({
            to: "POST-OPERATION REPORT",
            from: "OPERATOR",
            date: "Dec 18, 2024",
            subject: "Nexus Financial - Phase 1 Complete",
            reset: true,
            seed: 4242,
            roomTone: false,
            theme: TERMINAL_THEME,
          });

          tw.span("152.0s", "180.0s").typeText(
            [
              "/// OPERATION SUMMARY",
              "Target: Marcus Chen",
              "Status: COMPROMISED",
              "",
              "/// CREDENTIALS OBTAINED",
              "Username: mchen@nexus.local",
              "Password: N3xus$2024!",
              "SSO Token: ACTIVE",
              "",
              "/// ACCESS GAINED",
              "- Email (full archive)",
              "- Internal network (VPN)",
              "- HR Portal (all emp data)",
              "- Financial systems (read)",
              "",
              "/// PERSISTENCE ESTABLISHED",
              "Malicious macro injected",
              "Scheduled task created",
              "Reverse shell active",
              "",
              "/// NOTES",
              "Target: No idea what happened",
              "Confidence: High",
              "Next phase: Lateral movement",
              "",
              "Remember:",
              "The human is always the",
              "weakest link.",
              "",
              "/// END REPORT",
            ].join("\n"),
            {
              cps: 22,
              jitter: { minFrames: -1, maxFrames: 2 },
              mistakes: { rate: 0.01, max: 1 },
              pauses: { afterPunctFrames: 1, afterNewlineFrames: 2, afterSpaceFrames: 0 },
            },
          );
        },
      )
      .camera((cam) => {
        cam.at("150.0s").focus("paper", { scale: 1.02, duration: "0.4s" });
        cam.span("155.0s", "180.0s").trackCinematic("cursor", {
          scale: 1.35,
          smoothing: 0.22,
        });
      })
      
      // === AUDIO TRACK ===
      .audio((audio) => {
        // Dark ambient background
        audio.span("0s", "180s").bgm("/music/ambient-track.mp3", {
          volume: 0.25,
          fadeIn: "3s",
          fadeOut: "5s",
        });
      })
      
      // === CAMERA MOVEMENTS ===
      .camera((cam) => {
        // Initial typewriter
        cam.at("0.0s").set({ scale: 1 });
        cam.at("0.0s").animate({ scale: 1.03, duration: "2s", easing: "easeOut" });
        
        // Switch to WhatsApp
        cam.at("30.0s").animate({ scale: 1.08, duration: "0.8s", easing: "easeOut" });
        cam.at("35.0s").shake({
          intensityX: 4,
          intensityY: 3,
          frequency: 15,
          decay: 0.7,
          duration: "0.3s",
        });
        
        // During doubt/typing
        cam.at("52.0s").animate({ scale: 1.12, duration: "1s", easing: "easeOut" });
        
        // After credentials sent
        cam.at("112.0s").animate({ scale: 1.15, duration: "0.6s", easing: "cinematic" });
        
        // Back to terminal
        cam.at("150.0s").animate({ scale: 1.0, duration: "0.5s", easing: "easeOut" });
        cam.at("155.0s").animate({ scale: 1.05, duration: "1.5s", easing: "easeOut" });
        
        // Final punch
        cam.at("175.0s").shake({
          intensityX: 5,
          intensityY: 4,
          frequency: 20,
          decay: 0.8,
          duration: "0.4s",
        });
      })
      
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 2,
        }),
      )
      
      .build(),
});
