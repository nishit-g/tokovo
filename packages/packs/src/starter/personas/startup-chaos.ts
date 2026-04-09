import { definePersonaPack } from "../../define.js";

export const startupChaosPersonaPack = definePersonaPack({
  id: "startup-chaos",
  name: "Startup Chaos",
  version: "1.0.0",
  personas: {
    builder: {
      id: "builder",
      name: "Kabir",
      handle: "@kabirbuilds",
      bio: "Shipping under pressure.",
      avatar: "/avatars/kabir.png",
      traits: ["operator", "sarcastic", "deadline-driven"],
      defaultAppMetadata: {
        app_x: {
          verified: false,
          followerCount: 2180,
        },
      },
    },
    founder: {
      id: "founder",
      name: "Arjun",
      handle: "@arjunfounder",
      bio: "Founder. Vision. Thread enjoyer.",
      avatar: "/avatars/arjun.png",
      voice: "male_energetic_v1",
      traits: ["performative", "high-agency", "chaotic"],
      defaultAppMetadata: {
        app_x: {
          verified: true,
          followerCount: 12700,
        },
      },
    },
    investor: {
      id: "investor",
      name: "Neha",
      handle: "@nehacapital",
      bio: "Pre-seed. Product taste > pitch deck.",
      avatar: "/avatars/neha.png",
      traits: ["blunt", "analytical"],
      defaultAppMetadata: {
        app_x: {
          verified: true,
          followerCount: 43400,
        },
      },
    },
    meme_account: {
      id: "meme_account",
      name: "Build Meme Daily",
      handle: "@buildmemedaily",
      bio: "Posting startup pain before standup.",
      avatar: "/avatars/meme-daily.png",
      traits: ["satirical", "fast-reaction"],
      defaultAppMetadata: {
        app_x: {
          verified: false,
          followerCount: 88200,
        },
      },
    },
  },
});
