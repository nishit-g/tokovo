import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { KeyboardPlugin } from "@tokovo/compiler";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";

export default defineEpisode({
  meta: {
    id: "keyboard-input-exhaustive",
    title: "Keyboard Input Exhaustive",
    description:
      "New keyboard showcase proving reveal, text entry, suggestions, clear-on-send, and cross-app cleanup without leaking stale input.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 130,
    tags: ["system", "keyboard", "input", "typing", "composer"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 840,
    apps: ["app_whatsapp", "app_linkedin"],
  },
  build: () =>
    episode("keyboard-input-exhaustive", { fps: 30, duration: "28s", title: "Keyboard Input Exhaustive" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_linkedin"],
        os: {
          time: new Date("2026-04-10T19:05:00"),
          battery: 63,
          network: "wifi",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_editor", name: "Editor", avatar: "/avatars/avatar-priya.jpg", unreadCount: 1 },
        ],
      })
      .snapshot("app_linkedin", "phone", {
        users: [
          { id: "me", name: "Ira Sen", handle: "irasen", headline: "Design systems + storytelling", avatarUrl: "/avatars/avatar-zoe.jpg" },
          { id: "u1", name: "Noor Ahmed", handle: "noorahmed", headline: "Founder hiring PMs", avatarUrl: "/avatars/avatar-alex.jpg" },
        ],
        currentUserId: "me",
      })
      .whatsapp("phone", "dm_editor", (wa) => {
        wa.switchTo("dm_editor", "0.8s");
        wa.at("1.6s").receive("Editor", "Need the caption pass before upload.");
        wa.at("3.0s").send("On it. Rewriting now.", { typed: true, charDelay: 2 });
      })
      .deviceTrack("phone", (d) => {
        d.at("7.5s").keyboardShow({ returnKeyType: "send" });
        d.at("8.0s").keyboardType("Use the quieter opener and kill the exclamation mark.", { speed: "natural" });
        d.at("11.0s").keyboardSetSuggestions(["Looks good", "Ship it", "Need more time"]);
        d.at("11.8s").keyboardTapSuggestion(0);
        d.at("13.0s").keyboardHide();
        d.at("14.4s").openApp("app_linkedin", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
        d.at("18.0s").keyboardShow({ returnKeyType: "default" });
        d.at("18.5s").keyboardType("Hiring for taste is harder than hiring for output.", { speed: "natural" });
        d.at("22.0s").keyboardHide();
      })
      .track("app_linkedin", (getOrder) => new LinkedInTrackBuilder(30, "phone", getOrder), (li: any) => {
        li.at("15.2s").navigate("compose");
        li.at("16.2s").setComposeDraft("Hiring for taste is harder than hiring for output.");
        li.at("22.6s").post({
          id: "li_keyboard_post",
          authorId: "me",
          text: "Hiring for taste is harder than hiring for output.",
          createdAt: new Date("2026-04-10T19:06:00").getTime(),
          typed: true,
          charDelay: 2,
        });
        li.at("24.4s").navigate("feed");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam.span("2.8s", "5.5s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("8.2s").focus("keyboard", { scale: 1.14, duration: "0.25s" });
        cam.at("15.4s").focus("composer", { scale: 1.08, duration: "0.3s" });
        cam.span("18.5s", "22.2s").trackCinematic("keyboard", { scale: 1.1, smoothing: 0.16 });
      })
      .use(new KeyboardPlugin())
      .build(),
});
