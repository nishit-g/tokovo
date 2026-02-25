import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { SnapchatTrackBuilder } from "@tokovo/apps-snapchat";
import { AudioDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";



export default defineEpisode({
    meta: {
        id: "snapchat-bestie-drama",
        title: "My Bestie Screenshotted My Snap 💀",
        description: "A dramatic Snapchat story — streaks, snaps, and screenshots.",
        category: "production",
        tags: ["snapchat", "drama", "friendship", "viral"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 2700,
        apps: ["app_snapchat"],
    },
    build: () =>
        episode("snapchat-bestie-drama", {
            fps: 30,
            duration: "90s",
            title: "My Bestie Screenshotted My Snap 💀",
            description: "A dramatic Snapchat story — streaks, snaps, and screenshots.",
        })
            .device("phone", "iphone16", {
                app: "app_snapchat",
                os: {
                    time: new Date("2025-01-15T22:30:00"),
                    battery: 42,
                    network: "5G",
                },
            })
            // DM conversation with Mia
            .track(
                "app_snapchat",
                (getOrder) => new SnapchatTrackBuilder(30, "phone", "conv_mia", getOrder),
                (sc: SnapchatTrackBuilder) => {
                    // Setup
                    sc.at("0s").createConversation({
                        id: "conv_mia",
                        title: "Mia 💛",
                        participants: [{ id: "mia", name: "Mia" }],
                        streak: 247,
                    });
                    sc.at("0s").createConversation({
                        id: "conv_group",
                        title: "squad 🫶",
                        participants: [
                            { id: "mia", name: "Mia" },
                            { id: "jess", name: "Jess" },
                            { id: "taylor", name: "Taylor" },
                        ],
                        isGroup: true,
                        streak: 89,
                    });

                    // ACT 1: Late night DMs
                    sc.at("1s").openConversation("conv_mia");
                    sc.at("2s").receive("Mia", "heyyy you up?");
                    sc.at("4s").send("yeah can't sleep 😩", { typed: true });
                    sc.at("6s").receive("Mia", "same lol");
                    sc.at("8s").receive("Mia", "okay i need to tell you something");
                    sc.at("10s").send("omg what", { typed: true });
                    sc.at("11s").typingStart("Mia");
                    sc.at("13s").typingEnd("Mia");
                    sc.at("13s").receive("Mia", "so remember that party last weekend?");
                    sc.at("15s").send("yeah?? 👀", { typed: true });
                    sc.at("16s").typingStart("Mia");
                    sc.at("19s").typingEnd("Mia");
                    sc.at("19s").receive("Mia", "I saw something and I took a pic");
                    sc.at("21s").send("OMG SEND IT", { typed: true });

                    // ACT 2: The snap
                    sc.at("23s").receiveSnap("Mia", { snapType: "photo", timer: 5 });
                    sc.at("25s").openSnap("snap-750-0");
                    sc.at("28s").send("WAIT WHAT", { typed: true });
                    sc.at("29s").send("IS THAT WHO I THINK IT IS", { typed: true });
                    sc.at("31s").receive("Mia", "yep...");
                    sc.at("33s").send("I'm screenshotting this", { typed: true });
                    sc.at("34s").screenshot("snap-750-0");

                    // ACT 3: Mia reacts
                    sc.at("36s").receive("Mia", "DID YOU JUST SCREENSHOT 💀");
                    sc.at("38s").send("I HAD TO", { typed: true });
                    sc.at("39s").receive("Mia", "LMAOOO");
                    sc.at("41s").receive("Mia", "fair tbh");
                    sc.at("43s").send("this is actually insane", { typed: true });
                    sc.at("45s").receive("Mia", "i know right");
                    sc.at("47s").receive("Mia", "should we tell the group?");
                    sc.at("49s").send("YES", { typed: true });

                    // ACT 5: Plot twist — back to Mia DMs
                    sc.at("76s").setScreen("chat");
                    sc.at("76s").openConversation("conv_mia");
                    sc.at("77s").receive("Mia", "wait.");
                    sc.at("79s").receive("Mia", "taylor just screenshotted your snap in the group...");
                    sc.at("81s").send("SHE WHAT 😤", { typed: true });
                    sc.at("83s").receive("Mia", "���");
                    sc.at("85s").send("I literally said this stays in the group", { typed: true });
                    sc.at("87s").receive("Mia", "bestie welcome to snapchat 😭");

                    // Streak update
                    sc.at("89s").updateStreak(248);
                },
            )

            // Group conversation
            .track(
                "app_snapchat",
                (getOrder) => new SnapchatTrackBuilder(30, "phone", "conv_group", getOrder),
                (sc: SnapchatTrackBuilder) => {
                    // ACT 4: Group chat chaos
                    sc.at("51s").setScreen("chat");
                    sc.at("51s").openConversation("conv_group");
                    sc.at("52s").send("OKAY EVERYONE SIT DOWN 🪑", { typed: true });
                    sc.at("54s").receive("Jess", "what happened??");
                    sc.at("55s").receive("Taylor", "👀👀👀");
                    sc.at("57s").send("Mia caught something at the party", { typed: true });
                    sc.at("58s").typingStart("Jess");
                    sc.at("59s").typingEnd("Jess");
                    sc.at("59s").receive("Jess", "SPILL");
                    sc.at("61s").sendSnap({ snapType: "photo" });
                    sc.at("63s").receive("Taylor", "NO WAY");
                    sc.at("64s").receive("Jess", "IM DEAD 💀💀💀");
                    sc.at("66s").receive("Jess", "who else knows??");
                    sc.at("68s").send("just us rn", { typed: true });
                    sc.at("70s").receive("Taylor", "this stays in the group");
                    sc.at("72s").receive("Mia", "for real");
                    sc.at("74s").send("obvi 🤐", { typed: true });
                },
            )

            .use(new AudioDirectorPlugin({ mood: "tension", volume: 0.12 }))
            .use(new OSDirectorPlugin())
            .use(new KeyboardPlugin())
            .build(),
});
