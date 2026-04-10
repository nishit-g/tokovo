import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "cheating-exposed-new-dx",
    title: "My Best Friend Exposed My Boyfriend 💔 (NEW DX)",
    description:
      "A dramatic story of betrayal, evidence, and confrontation - using new DX features",
    category: "production",
    tags: ["whatsapp", "drama", "relationship", "viral", "new-dx"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 4200,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("cheating-exposed-new-dx", {
      fps: 30,
      duration: "140s",
      title: "My Best Friend Exposed My Boyfriend 💔 (NEW DX)",
      description:
        "Migrated to new DX - initial messages, context switching, relative timing",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-18T09:15:00"),
          battery: 78,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_jake",
            name: "Jake ❤️",
            avatar: "/avatars/jake.png",
            messages: [
              { from: "Jake", text: "goodnight babe 😘", timestamp: -86400 },
              { from: "Me", text: "goodnight 💕", timestamp: -86300 },
            ],
          },
          {
            id: "dm_sarah",
            name: "Sarah 💕",
            avatar: "/avatars/sarah.png",
            messages: [],
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "", getOrder),
        (wa) => {
          // Scene 1: Morning with Jake (continues from yesterday's chat history)
          wa.openChat("dm_jake");
          wa.at("1s").receive("Jake", "good morning beautiful 😘");
          wa.pause(2);
          wa.reply("morning babe! miss you");
          wa.pause(1.5);
          wa.receive("Jake", "miss you too, can't wait for tonight");
          wa.pause(1.5);
          wa.reply("me too 🥰", 1);

          // Back to chat list
          wa.pause(2.5);
          wa.goBack();
          wa.pause(1);

          // Scene 2: Sarah reaches out
          wa.openChat("dm_sarah");
          wa.pause(1);
          wa.receive("Sarah", "hey");
          wa.receive("Sarah", "are you free rn?");
          wa.pause(1.5);
          wa.reply("yeah what's up", 1);
          wa.pause(1);
          wa.receive("Sarah", "I need to show you something");
          wa.pause(1.5);
          wa.reply("okay? you're scaring me", 1);

          wa.pause(2);
          wa.receive("Sarah", "I don't know how to say this");
          wa.pause(2);
          wa.reply("just tell me", 1);
          wa.pause(1.5);
          wa.receive("Sarah", "promise you won't hate me for telling you");
          wa.pause(1.5);
          wa.reply("I promise, what is it??", 1);

          // The reveal
          wa.pause(2);
          wa.receive("Sarah", "I saw Jake last night");
          wa.pause(2);
          wa.reply("okay? he said he was at home", 1);
          wa.pause(2);
          wa.receive("Sarah", "he wasn't alone");
          wa.pause(3);
          wa.reply("what do you mean", 1);
          wa.pause(1.5);
          wa.receive("Sarah", "I took photos");
          wa.receive("Sarah", "I'm so sorry");

          // Evidence
          wa.pause(3);
          wa.receiveImage("Sarah", "/placeholders/media.svg");
          wa.pause(5);
          wa.receiveImage("Sarah", "/placeholders/media.svg");
          wa.pause(4);
          wa.send("is that...");
          wa.pause(2);
          wa.receive("Sarah", "yes");
          wa.receive("Sarah", "I'm so sorry I had to tell you");
          wa.pause(3);
          wa.reply("thank you for telling me", 2);

          // Confrontation
          wa.pause(4);
          wa.goBack();
          wa.pause(2);

          wa.openChat("dm_jake");
          wa.pause(1);
          wa.send("Jake we need to talk");
          wa.pause(2);
          wa.receive("Jake", "hey! what's up babe");
          wa.pause(1);
          wa.send("where were you last night");
          wa.pause(2);
          wa.receive("Jake", "at home why??");
          wa.pause(1);
          wa.send("don't lie to me");
          wa.pause(2);
          wa.receive("Jake", "what are you talking about");
          wa.pause(2);
          wa.send("I know about her");
          wa.pause(3);
          wa.receive("Jake", "baby listen");
          wa.receive("Jake", "it's not what you think");
          wa.pause(2);
          wa.reply("we're done", 1);
          wa.pause(3);
          wa.receive("Jake", "WAIT");
          wa.receive("Jake", "please let me explain");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1.15 });
      })
      .build(),
});
