import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

export default defineEpisode({
  meta: {
    id: "flirty-whatsapp-romance",
    title: "The Game of Flirts",
    description: "A couple flirts over WhatsApp - from matching to date planning",
    category: "production",
    tags: ["whatsapp", "romance", "flirty", "dating", "voice-notes"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("flirty-whatsapp-romance", {
      fps: 30,
      duration: "30s",
      title: "The Game of Flirts",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2025-02-14T21:30:00"),
          battery: 45,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_riya",
            name: "Riya",
            avatar: "/avatars/avatar-riya.jpg",
            unreadCount: 1,
          },
        ],
      })
      .background({ type: "solid", color: "#1a1a2e" })
      .track(
        "app_whatsapp",
        (getOrder) => {
          const builder = new WhatsAppTrackBuilder(30, "phone", "dm_riya", getOrder);
          Object.defineProperty(builder, "_getOrder", {
            value: getOrder,
            configurable: true,
          });
          return builder;
        },
        (wa) => {
          // Scene 1: Opening Match
          wa.openChatList("0s");
          wa.switchTo("dm_riya", "1.5s");

          // Opening flirt
          wa.at("2s").receive("Riya", "So... I swiped right because of your dog's picture. Just to be clear. 🐕");
          wa.at("3s").send("Fair enough. Sir Whiskers demands an explanation though - he says he's more than just a wingman 😂");
          
          // Banter continues
          wa.at("5s").receive("Riya", "Sir Whiskers sounds like a man of culture. I'll have you know I also appreciate fine coffee, bad puns, and apparently very cute girls with cute dogs 👀");
          wa.at("7s").send("Wow. Smooth. Did you practice that in the mirror? 🪞");
          wa.at("8.5s").receive("Riya", "Maybe once or twice... or five times. Don't judge me. 😏");
          
          // Voice note exchange
          wa.at("10s").sendVoice(4);
          wa.at("11s").receiveVoice("Riya", 5);
          
          // Late night flirty banter
          wa.at("13s").receive("Riya", "Okay but real talk - why are you still awake? 💭");
          wa.at("14.5s").send("Because my brain won't stop thinking about something...");
          wa.at("15.5s").receive("Riya", "Oh? Do I want to know? 👀");
          wa.at("17s").send("Maybe... what you look like in oversized pajamas 👀👀");
          wa.at("18.5s").receive("Riya", "Aarav. You're playing with fire here 🔥");
          wa.at("20s").send("Someone had to make the first move 😏");
          
          // Sweet emotional turn
          wa.at("22s").receive("Riya", "Okay real talk for a sec though... Like genuinely - I had the worst week and somehow talking to you makes it feel... lighter? That's weird right? 😂");
          wa.at("24s").send("Not weird at all. That's kind of the whole point, isn't it? Finding someone who makes the bad days feel less heavy. 💕");
          wa.at("26s").receive("Riya", "Around the same time you started using the heart emoji... when did this become deep? 😂💕");
          wa.at("27.5s").send("I mean... it was relevant. 🤷");
          
          // Date planning
          wa.at("29s").send("Okay so hypothetically... if I asked you out for Saturday... what would hypothetically be your answer?");
        },
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 2,
        }),
      )
      .build(),
});
