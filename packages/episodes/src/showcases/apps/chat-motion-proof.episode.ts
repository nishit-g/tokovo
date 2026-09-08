import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";
import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
} from "@tokovo/dsl";

const base = Date.parse("2026-04-10T09:41:00Z");
const history = Array.from({ length: 24 }, (_, index) => ({
  id: `history-${index}`,
  from: index % 3 === 0 ? "me" : "Ava",
  text: [
    "I checked the route.",
    "There is a quieter entrance by the garden. We can meet there instead of waiting on the main road.",
    "Great, see you there.",
  ][index % 3],
  sentAt: base - (24 - index) * 20_000 - (index < 12 ? 86_400_000 : 0),
}));
const draft = "Meet me by the garden at 6:30.";

export const chatMotionProofEpisodes = (["imessage", "whatsapp"] as const).map(
  (app) =>
    defineEpisode({
      meta: {
        id: `${app}-chat-motion-proof`,
        title: `${app === "imessage" ? "iMessage" : "WhatsApp"} Long Chat Motion`,
        category: "showcase",
        catalogType: "app_showcase_theme",
        appId: `app_${app}`,
        visibility: "public",
        sortOrder: 725,
        description:
          "Long-thread regression: arrivals, keyboard corrections, receipts, composed photo reply and camera tracking.",
        tags: ["chat", "motion", "regression"],
      },
      config: {
        format: "1080x1920",
        durationInFrames: 540,
        apps: [`app_${app}`],
      },
      build: () => {
        const ep = episode(`${app}-chat-motion-proof`, {
          fps: 30,
          duration: "18s",
        }).device("phone", "iphone16", {
          app: `app_${app}`,
          os: { time: new Date(base), battery: 92, network: "wifi" },
        });
        if (app === "imessage") {
          ep.snapshot("app_imessage", "phone", {
            conversations: [
              {
                id: "chat",
                title: "Ava",
                avatar: "/avatars/avatar-ava.jpg",
                participants: [
                  { id: "me", name: "You", isMe: true },
                  { id: "Ava", name: "Ava" },
                ],
                unreadCount: 0,
                messages: history.map((item) => ({
                  id: item.id,
                  conversationId: "chat",
                  senderId: item.from,
                  senderName: item.from,
                  fromMe: item.from === "me",
                  kind: "text",
                  text: item.text,
                  timestamp: 0,
                  sentAt: item.sentAt,
                  tapbacks: [],
                })),
              },
            ],
          })
            .view("app_imessage", "phone", {
              screen: "chat",
              conversationId: "chat",
            })
            .imessage("phone", "chat", (im) => {
              im.at("1s").typing("Ava", true);
              im.at("2s").receive("Ava", "Here?", {
                messageId: "short",
                sentAt: base + 2_000,
              });
              im.at("3s").tapback({
                messageId: "short",
                type: "heart",
                fromMe: true,
              });
              im.at("10s").send(draft, {
                messageId: "sent",
                deliveredAt: 318,
                readAt: 336,
                sentAt: base + 10_000,
              });
              im.at("12s").receiveMedia(
                "Ava",
                [
                  {
                    kind: "image",
                    url: "/media/launch-board.svg",
                    width: 260,
                    height: 180,
                  },
                ],
                { messageId: "photo", sentAt: base + 12_000 },
              );
              im.at("14s").send("That is the one!", {
                messageId: "reply",
                replyTo: { messageId: "photo" },
                sentAt: base + 14_000,
              });
            });
        } else {
          ep.snapshot("app_whatsapp", "phone", {
            conversations: [
              {
                id: "chat",
                name: "Ava",
                avatar: "/avatars/avatar-ava.jpg",
                messages: history.map((item) => ({
                  id: item.id,
                  from: item.from,
                  type: "text",
                  text: item.text,
                  timestampMs: item.sentAt,
                })),
              },
            ],
          }).whatsapp("phone", "chat", (wa) => {
            wa.switchTo("chat", "0s");
            wa.span("1s", "2s").typing("Ava");
            wa.at("2s").receive("Ava", "Here?", { messageId: "short" });
            wa.at("3s").react("short", "❤️");
            wa.at("10s").send(draft, { messageId: "sent" });
            wa.at("12s").receiveImage("Ava", "/media/launch-board.svg", {
              messageId: "photo",
            });
            wa.at("14s").send("That is the one!", {
              messageId: "reply",
              replyTo: { messageId: "photo" },
            });
            wa.at("15s").startGesture("reply", "long_press");
            wa.at("15.15s").completeGesture("reply");
            wa.at("15.8s").cancelGesture("reply");
            wa.at("16s").openMediaViewer("photo");
            wa.at("16.45s").closeMediaViewer();
            wa.openChatList("16.8s");
            wa.switchTo("chat", "17.3s");
          });
        }
        return ep
          .input("phone", "composer", {
            appId: `app_${app}`,
            at: "4s",
            submitAt: "10s",
            until: "10.6s",
            script: [
              { type: "setSuggestions", suggestions: ["Meet", "I'll", "Can"] },
              { type: "type", text: "Meet me by the gate" },
              { type: "pause", frames: 12 },
              { type: "setSelection", selection: { anchor: 15, focus: 19 } },
              {
                type: "setSuggestions",
                suggestions: ["gate", "garden", "entrance"],
              },
              { type: "pause", frames: 14 },
              {
                type: "chooseSuggestion",
                index: 1,
                text: "garden",
                replaceRange: { anchor: 15, focus: 19 },
              },
              { type: "type", text: " at " },
              { type: "switchLayout", layout: "numbers" },
              { type: "setSuggestions", suggestions: [] },
              { type: "type", text: "6:30." },
              { type: "pause", frames: 8 },
              { type: "switchLayout", layout: "letters" },
              {
                type: "setSuggestions",
                suggestions: ["See", "Thanks", "Okay"],
              },
            ],
            expectedFinalValue: draft,
            cadence: { style: "fast" },
            keyboard: { returnKey: "send", appearance: "light" },
          })
          .input("phone", "composer", {
            appId: `app_${app}`,
            at: "12.2s",
            submitAt: "14s",
            until: "14.5s",
            script: [{ type: "type", text: "That is the one!" }],
            expectedFinalValue: "That is the one!",
            cadence: { style: "fast" },
            keyboard: { returnKey: "send", appearance: "light" },
          })
          .cinematics(
            cinematicProgram(
              {
                fps: 30,
                duration: 540,
                stage: {
                  width: 1080,
                  height: 1920,
                  devices: [
                    {
                      deviceId: "phone",
                      x: 210,
                      y: 180,
                      width: 660,
                      height: 1413,
                      zIndex: 10,
                    },
                  ],
                },
              },
              (cinema) => {
                const subject = cameraSubject.scope("phone", `app_${app}`);
                cinema.planFamily({
                  plans: [{ id: "motion-proof", default: true }],
                  outputs: [
                    {
                      id: "main",
                      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
                      coveragePolicy: "require-shots",
                      compositionProfileId: "hero-device",
                      travel: {
                        mode: "stabilized",
                        subject: subject.body,
                        maxDriftPx: [30, 44],
                      },
                      defaultRig: {
                        id: "phone",
                        subject: subject.body,
                        frame: { fill: 0.84, padding: 30, min: 0.5, max: 1.1 },
                        motion: { type: "minimum-jerk", durationFrames: 18 },
                      },
                    },
                  ],
                  sequences: [
                    {
                      outputId: "main",
                      end: 540,
                      shots: [
                        shot("full-phone", 375, subject.body).frame({
                          fill: 0.84,
                          mode: "contain",
                          padding: 30,
                          min: 0.5,
                          max: 1.1,
                        }),
                        shot(
                          "follow-message",
                          app === "whatsapp" ? 75 : 165,
                          subject.semantic(
                            app === "imessage"
                              ? "imessage_last_message"
                              : "last-message",
                          ),
                        )
                          .frame({
                            fill: 0.72,
                            mode: "width",
                            padding: 40,
                            min: 0.5,
                            max: 1.35,
                          })
                          .fallback(subject.body)
                          .settle(18),
                        ...(app === "whatsapp"
                          ? [
                              shot("interaction-flow", 90, subject.body).frame({
                                fill: 0.84,
                                mode: "contain",
                                padding: 30,
                                min: 0.5,
                                max: 1.1,
                              }),
                            ]
                          : []),
                      ],
                    },
                  ],
                });
              },
            ),
          )
          .build();
      },
    }),
);
