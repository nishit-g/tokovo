import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "feature-showcase",
    title: "WhatsApp Features Showcase",
    description: "Demo of all WhatsApp message types and features",
    category: "production",
    tags: ["whatsapp", "demo", "features", "showcase"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1800,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("feature-showcase", {
      fps: 30,
      duration: "60s",
      title: "WhatsApp Features Showcase",
      description: "Demo of all WhatsApp message types and features",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_demo",
            name: "Feature Demo 🎬",
            avatar: "/avatars/demo-avatar.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-20T14:00:00"),
          battery: 85,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_demo", getOrder);
        },
        (wa) => {
          wa.at("1s").receive("Demo", "Welcome to the feature showcase! 👋");

          wa.at("3s").receive("Demo", "Let's start with basic messages...");
          wa.span("4s", "5s").typing("me");
          wa.at("5s").send("This is a sent message ✅");

          wa.at("7s").receiveImage("Demo", "/images/sample-photo.jpg", {
            caption: "Here's an image with caption 📸",
          });
          wa.at("9s").sendImage("/images/reply-photo.jpg");

          wa.at("11s").receiveVideo("Demo", "/videos/sample-video.mp4", {
            duration: 15,
            caption: "Video message 🎥",
          });

          wa.at("14s").receiveVoice("Demo", 8);
          wa.at("17s").sendVoice(5);

          wa.at("20s").receiveGif("Demo", "/gifs/hello-wave.gif");

          wa.at("23s").receiveSticker("Demo", "/stickers/thumbs-up.webp");
          wa.at("25s").sendSticker("/stickers/heart-eyes.webp");

          wa.at("28s").receiveDocument("Demo", {
            fileName: "Important_Report.pdf",
            fileSize: "4.2 MB",
            fileType: "pdf",
          });
          wa.at("30s").sendDocument({
            fileName: "My_Notes.docx",
            fileSize: "1.1 MB",
            fileType: "docx",
          });

          wa.at("33s").receiveContact("Demo", {
            contactName: "John Smith",
            contactPhone: "+1 555-123-4567",
            contactAvatarUrl: "/avatars/john-smith.jpg",
          });
          wa.at("35s").sendContact({
            contactName: "Jane Doe",
            contactPhone: "+1 555-987-6543",
          });

          wa.at("38s").receiveLocation("Demo", {
            latitude: 37.7749,
            longitude: -122.4194,
            locationName: "San Francisco",
            locationAddress: "California, USA",
            mapThumbnailUrl: "/maps/sf-map.png",
          });
          wa.at("40s").sendLocation({
            latitude: 40.7128,
            longitude: -74.006,
            locationName: "New York City",
            locationAddress: "New York, USA",
          });

          wa.at("43s").receive("Demo", "Now let's try message actions...");

          wa.at("45s").receive("Demo", "This message will be edited");
          wa.at("47s").editMessage(20, "This message has been EDITED! ✏️");

          wa.at("49s").receive("Demo", "This message will be deleted");
          wa.at("51s").deleteMessage(21);

          wa.at("53s").forward(1, { forwardedFrom: "Another Chat" });

          wa.at("55s").react({ index: 0 }, "❤️");
          wa.at("56s").react({ index: 5 }, "🔥");
          wa.at("57s").react({ index: 10 }, "😂");

          wa.at("59s").receive("Demo", "That's all the features! 🎉");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });
        cam.at("7s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
        cam.at("11s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
        cam.at("14s").animate({ scale: 1.05, duration: "0.3s" });
        cam
          .at("23s")
          .animate({ scale: 1.15, duration: "0.4s", easing: "easeOut" });
        cam.at("28s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
        cam.at("33s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
        cam.at("38s").focus("lastMessage", { scale: 1.15, duration: "0.5s" });
        cam.at("45s").animate({ scale: 1.1, duration: "0.3s" });
        cam.at("47s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 15,
          decay: 0.8,
          duration: "0.3s",
        });
        cam.at("51s").shake({
          intensityX: 4,
          intensityY: 3,
          frequency: 20,
          decay: 0.85,
          duration: "0.3s",
        });
        cam.at("55s").animate({ scale: 1.05, duration: "0.5s" });
        cam.at("59s").animate({ scale: 1, duration: "1s", easing: "easeOut" });
      })

      .audio((audio) => {
        audio
          .span("0s", "60s")
          .bgm("ambient_soft", { volume: 0.1, fadeIn: "2s", fadeOut: "2s" });
      })

      .os((os) => {
        os.at("20s").time(new Date("2024-12-20T14:01:00"));
        os.at("40s").time(new Date("2024-12-20T14:02:00"));
        os.at("60s").time(new Date("2024-12-20T14:03:00"));
      })

      .mark("intro", "1s")
      .mark("text_messages", "3s")
      .mark("image_messages", "7s")
      .mark("video_message", "11s")
      .mark("voice_messages", "14s")
      .mark("gif_message", "20s")
      .mark("sticker_messages", "23s")
      .mark("document_messages", "28s")
      .mark("contact_cards", "33s")
      .mark("location_cards", "38s")
      .mark("message_actions", "43s")
      .mark("edit_message", "45s")
      .mark("delete_message", "49s")
      .mark("forward_message", "53s")
      .mark("reactions", "55s")
      .mark("finale", "59s")

      .section("intro", "0s", "3s")
      .section("basic_messages", "3s", "7s")
      .section("media_messages", "7s", "23s")
      .section("rich_content", "23s", "43s")
      .section("message_actions", "43s", "58s")
      .section("outro", "58s", "60s")

      .build(),
});
