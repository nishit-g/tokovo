/**
 * Midnight Maggi Crisis - A Classic Bakchod Episode
 *
 * Two friends. 2 AM. Zero logic. Maximum chaos.
 * The eternal struggle: Zomato vs Swiggy vs frozen maggi.
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import {
  CameraDirectorPlugin,
  AudioDirectorPlugin,
  OSDirectorPlugin,
  KeyboardPlugin,
} from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "midnight-maggi-crisis",
    title: "Midnight Maggi Crisis 🍜",
    description:
      "2 AM. Hunger. Zero paisa. Maximum overthinking. A story as old as time.",
    category: "production",
    tags: ["whatsapp", "comedy", "hindi", "food", "relatable"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2400,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("midnight-maggi-crisis", {
      fps: 30,
      duration: "80s",
      title: "Midnight Maggi Crisis 🍜",
      description: "The eternal 2 AM food debate.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-17T02:15:00"),
          battery: 8,
          network: "4G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_arsh",
            name: "Arsh " + "🔥",
            avatar: "/avatars/avatar-arsh.jpg",
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/bedroom-dark.png" })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_arsh", getOrder);
        },
        (wa) => {
          wa.switchTo("dm_arsh", "0s");
          
          wa.at("1s").receive("Arsh", "bhai");
          wa.at("1.5s").receive("Arsh", "bhai");
          wa.at("2s").receive("Arsh", "BHAI");
          wa.at("2.5s").receive("Arsh", "SOJA RAHA HAI KYA");

          wa.span("4s", "6s").typing("me");
          wa.at("6s").send("kya hai bc 2 baj rahe hain");

          wa.span("8s", "10s").typing("them");
          wa.at("10s").receive("Arsh", "bhai maine socha");
          wa.at("11s").receive("Arsh", "khaana khana hai");

          wa.span("13s", "14s").typing("me");
          wa.at("14s").send("to khale");
          wa.at("15s").send("wahi");

          wa.span("17s", "20s").typing("them");
          wa.at("20s").receive("Arsh", "nai bhai");
          wa.at("21s").receive("Arsh", "wo nai");
          wa.at("22s").receive("Arsh", "khaana khaana hai");

          wa.span("24s", "26s").typing("me");
          wa.at("26s").send("same thing hai arsh");
          wa.at("27s").send("kya fark padta hai");

          wa.at("29s").receiveSticker("Arsh", "/placeholders/media.svg");

          wa.span("31s", "35s").typing("them");
          wa.at("35s").receive("Arsh", "ARE VAHI MAT BOL");
          wa.at("36s").receive("Arsh", "zomato open kar");
          wa.at("37s").receive("Arsh", "swiggy open kar");
          wa.at("38s").receive("Arsh", "zepto open kar");
          wa.at("39s").receive("Arsh", "b/w 3 options");

          wa.span("41s", "43s").typing("me");
          wa.at("43s").send("woh toh direct bol do");

          wa.span("45s", "50s").typing("them");
          wa.at("50s").receive("Arsh", "chup raho");
          wa.at("51s").receive("Arsh", "yeh ek process hai");
          wa.at("52s").receive("Arsh", "20 mins minimum");
          wa.at("53s").receive("Arsh", "no shortcut");

          wa.span("55s", "57s").typing("me");
          wa.at("57s").send("achha");
          wa.at("58s").send("tum karo process");
          wa.at("59s").send("main so ja raha hun");

          wa.at("61s").receiveImage("Arsh", "/placeholders/media.svg", {
            caption: "yeh dekh 👀",
          });

          wa.span("63s", "65s").typing("me");
          wa.at("65s").send("kya hai yeh");
          wa.at("66s").send("screenshot hai kya");

          wa.span("68s", "72s").typing("them");
          wa.at("72s").receive("Arsh", "bhai");
          wa.at("73s").receive("Arsh", "biryaniii");
          wa.at("74s").receive("Arsh", "magar");
          wa.at("75s").receive("Arsh", "2 hour delivery");

          wa.span("77s", "78s").typing("me");
          wa.at("78s").send("......");

          wa.span("80s", "82s").typing("me");
          wa.at("82s").send("to frozen maggi kyu nahi");

          wa.span("84s", "90s").typing("them");
          wa.at("90s").receive("Arsh", "bhai wo toh");
          wa.at("91s").receive("Arsh", "last baar");
          wa.at("92s").receive("Arsh", "monday ko khaya tha");
          wa.at("93s").receive("Arsh", "wo bhi 2 PM ko");
          wa.at("94s").receive("Arsh", "ab change chahiye");

          wa.span("96s", "98s").typing("me");
          wa.at("98s").send("aur beryani kab khayi thi");
          wa.at("99s").send("woh bhi last month?");

          wa.at("101s").receive("Arsh", "wo alag hai");

          wa.span("103s", "105s").typing("me");
          wa.at("105s").send("kaise alag");
          wa.at("106s").send("bhai kya logic hai");

          wa.span("108s", "115s").typing("them");
          wa.at("115s").receive("Arsh", "bhai samjho na");
          wa.at("116s").receive("Arsh", "biryaani se");
          wa.at("117s").receive("Arsh", "sugar level theek hoti hai");
          wa.at("118s").receive("Arsh", "blood group bhi badal jata hai");
          wa.at("119s").receive("Arsh", "impression badh jata hai");

          wa.span("121s", "123s").typing("me");
          wa.at("123s").send("yeh sab bakwas hai");

          wa.at("125s").receiveVoice("Arsh", 8);

          wa.span("133s", "140s").typing("me");
          wa.at("140s").send("Arsh");
          wa.at("141s").send("5 min mein ao");
          wa.at("142s").send("ghar pe maggi bana deta hun");

          wa.span("144s", "146s").typing("them");
          wa.at("146s").receive("Arsh", "????");
          wa.at("147s").receive("Arsh", "TUNE YEH KYA KHA");
          wa.at("148s").receive("Arsh", "MAGGI?????");

          wa.span("150s", "152s").typing("me");
          wa.at("152s").send("haan kya hai");

          wa.span("154s", "158s").typing("them");
          wa.at("158s").receive("Arsh", "bhai");
          wa.at("159s").receive("Arsh", "maine 20 mins");
          wa.at("160s").receive("Arsh", "process kiya");
          wa.at("161s").receive("Arsh", "aur tu");

          wa.span("163s", "165s").typing("me");
          wa.at("165s").send("haan toh");
          wa.at("166s").send("ab aao");

          wa.at("168s").react(
            { conversationId: "dm_arsh", messageIndex: 42 },
            "🙏",
          );

          wa.at("170s").receive("Arsh", "chal raha hun");
          wa.at("172s").receive("Arsh", "dahi le aana");

          wa.span("174s", "176s").typing("me");
          wa.at("176s").send("kyu");

          wa.span("178s", "182s").typing("them");
          wa.at("182s").receive("Arsh", "maggi");
          wa.at("183s").receive("Arsh", "with dahi");
          wa.at("184s").receive("Arsh", "top secret recipe");

          wa.span("186s", "188s").typing("me");
          wa.at("188s").send("haa haa");
          wa.at("189s").send("2 min mein");

          wa.at("191s").receive("Arsh", "oye");
          wa.at("192s").receive("Arsh", "aur samosa");

          wa.span("194s", "196s").typing("me");
          wa.at("196s").send("KAIIII");

          wa.at("198s").receiveGif("Arsh", "/placeholders/media.svg");

          wa.span("200s", "202s").typing("me");
          wa.at("202s").send("chal bhai");
          wa.at("203s").send("jaldi ao");
          wa.at("204s").send("bhookh lagi hai ab");

          wa.at("206s").receive("Arsh", "🥺");
        },
      )
      .use(new CameraDirectorPlugin())
      .use(new AudioDirectorPlugin({ mood: "chill", volume: 0.1 }))
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2024-12-17T02:15:00"),
          startBattery: 8,
          batteryDrainRate: 0.5,
          updateInterval: "15s",
        }),
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 5,
          excludeShortMessages: 2,
        }),
      )

      .build(),
});
