import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";

export default defineEpisode({
  meta: {
    id: "linkedin-story-v2",
    title: "LinkedIn Story V2",
    description:
      "A new LinkedIn story where a recruiter's polished outreach unravels into the most honest hiring conversation of the week.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 120,
    tags: ["story", "linkedin", "recruiting", "messages", "work"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1080,
    apps: ["app_linkedin"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T08:40:00").getTime();

    return episode("linkedin-story-v2", { fps: 30, duration: "36s", title: "LinkedIn Story V2" })
      .device("phone", "iphone16", {
        app: "app_linkedin",
        os: {
          time: new Date("2026-04-10T08:42:00"),
          battery: 88,
          network: "wifi",
        },
      })
      .snapshot("app_linkedin", "phone", {
        currentUserId: "me",
        users: [
          { id: "me", name: "Ira Sen", handle: "irasen", headline: "Design systems lead", avatarUrl: "/avatars/avatar-zoe.jpg" },
          { id: "u_rec", name: "Noor Ahmed", handle: "noorahmed", headline: "Founder hiring design leadership", avatarUrl: "/avatars/avatar-alex.jpg" },
        ],
        threads: [{ id: "li_story_dm_v2", participantIds: ["me", "u_rec"], title: "Noor Ahmed", unreadCount: 1 }],
        messages: [{ id: "li_story_seed_1", threadId: "li_story_dm_v2", senderId: "u_rec", text: "Loved your work. Could I steal 20 minutes this week?", createdAt: baseTs - 10000 }],
      })
      .track("app_linkedin", (getOrder) => new LinkedInTrackBuilder(30, "phone", getOrder), (li) => {
        li.at("1.0s").navigate("messages");
        li.at("2.2s").navigate("thread", { threadId: "li_story_dm_v2" });
        li.at("3.4s").sendDM({
          id: "li_story_msg_2",
          threadId: "li_story_dm_v2",
          senderId: "me",
          text: "Happy to chat. What's the actual role, not the charming version?",
          createdAt: baseTs + 6000,
          typed: true,
          charDelay: 2,
        });
        li.at("6.2s").sendDM({
          id: "li_story_msg_3",
          threadId: "li_story_dm_v2",
          senderId: "u_rec",
          text: "Honestly? We need someone to fix product trust without slowing the founder down.",
          createdAt: baseTs + 12000,
        });
        li.at("8.8s").sendDM({
          id: "li_story_msg_4",
          threadId: "li_story_dm_v2",
          senderId: "me",
          text: "So you want judgment, not just output.",
          createdAt: baseTs + 18000,
          typed: true,
          charDelay: 2,
        });
      })
      .camera((cam) => {
        cam.at("1.1s").focus("message_list", { scale: 1.05, duration: "0.35s" });
        cam.at("2.3s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
