import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { TeamsTrackBuilder } from "@tokovo/apps-teams";

export default defineEpisode({
  meta: {
    id: "teams-enterprise-exhaustive-showcase",
    title: "Teams Enterprise Exhaustive Showcase",
    description:
      "End-to-end Teams enterprise flow: channel ops, threads, mentions, presence, notifications, DM escalation, and call lifecycle.",
    category: "showcase",
    tags: [
      "teams",
      "enterprise",
      "dm",
      "channels",
      "threads",
      "mentions",
      "presence",
      "calls",
      "notifications",
      "deterministic",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2700,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-enterprise-exhaustive-showcase", {
      fps: 30,
      duration: "90s",
      title: "Teams Enterprise Exhaustive Showcase",
      description: "Large deterministic Teams stress run for visual + runtime validation.",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        os: {
          time: new Date("2026-02-24T09:15:00"),
          battery: 84,
          network: "5G",
        },
      })
      .track(
        "app_teams",
        (getOrder) => new TeamsTrackBuilder(30, "phone", getOrder),
        (teams: TeamsTrackBuilder) => {
          teams.openChatList("0s");

          teams.at("0.5s").setPresence("u_me", "available");
          teams.at("0.7s").setPresence("u_pm", "busy");
          teams.at("0.9s").setPresence("u_sre", "available");
          teams.at("1.1s").setPresence("u_design", "away");

          teams.switchChannel("launch-war-room", "1.5s", "th_release_blocker");
          teams.at("2.0s").channelPost({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_pm",
            senderName: "Priya",
            text: "War room open. We ship only after green checks on API + payments + notifications.",
            typed: true,
          });
          teams.at("4.0s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_sre",
            senderName: "Arjun",
            text: "API p95 is elevated. Starting rollback canary on cluster-b.",
          });
          teams.at("5.0s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_me",
            senderName: "Nishit",
            text: "I am on incident timeline + customer blast draft.",
            typed: true,
          });
          teams.at("6.3s").notify("n_launch_1", "@u_exec mentioned in #launch-war-room", 180);

          teams.at("7.5s").openThread("launch-war-room", "th_db_timeout");
          teams.at("8.0s").channelPost({
            channelId: "launch-war-room",
            threadId: "th_db_timeout",
            senderId: "u_sre",
            senderName: "Arjun",
            text: "DB timeout spikes isolated to write-heavy endpoints.",
          });
          teams.at("9.5s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_db_timeout",
            senderId: "u_backend",
            senderName: "Maya",
            text: "Applying query plan pin + index hint now.",
            typed: true,
          });
          teams.at("11.0s").closeThread("th_db_timeout");

          teams.switchDm("dm_exec", "12.0s");
          teams.at("12.5s").dmReceive({
            dmId: "dm_exec",
            fromId: "u_exec",
            fromName: "Rohan (Exec)",
            text: "Need customer impact estimate in 10 minutes.",
          });
          teams.at("14.0s").dmSend({
            dmId: "dm_exec",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Initial estimate: 8-12% API degradation, no data loss observed.",
            typed: true,
          });
          teams.at("15.0s").dmReceive({
            dmId: "dm_exec",
            fromId: "u_exec",
            fromName: "Rohan (Exec)",
            text: "Proceed with controlled rollback and send 30-min updates.",
          });

          teams.switchChannel("launch-war-room", "16.5s", "th_release_blocker");
          teams.at("17.0s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Exec approved controlled rollback. 30-min comms cadence starts now.",
            typed: true,
          });
          teams.at("18.5s").notify("n_launch_2", "Rollback approved. Update thread pinned.", 180);

          teams.at("19.0s").startCall({
            callId: "call_war_room_01",
            participantIds: ["u_me", "u_pm", "u_sre", "u_backend"],
            scope: "channel",
            channelId: "launch-war-room",
          });
          teams.at("20.0s").setPresence("u_me", "busy");
          teams.at("20.2s").setPresence("u_sre", "busy");

          teams.at("23.0s").endCall("call_war_room_01");

          teams.switchChannel("eng-alerts", "24.0s", "th_ci_failures");
          teams.at("24.5s").channelPost({
            channelId: "eng-alerts",
            threadId: "th_ci_failures",
            senderId: "u_ci",
            senderName: "CI Bot",
            text: "Pipeline red: packages/compiler regression test failed.",
          });
          teams.at("25.3s").channelReply({
            channelId: "eng-alerts",
            threadId: "th_ci_failures",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Treat as blocker for hotfix merge; attach logs and bisect commit.",
            typed: true,
          });
          teams.at("26.2s").notify("n_ci_1", "CI blocker posted in #eng-alerts", 150);

          teams.switchDm("dm_sre", "27.5s");
          teams.at("28.0s").dmReceive({
            dmId: "dm_sre",
            fromId: "u_sre",
            fromName: "Arjun",
            text: "Canary looks healthy for 6 minutes. Error rate down 70%.",
          });
          teams.at("29.0s").dmSend({
            dmId: "dm_sre",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Great. Hold 10 min soak then notify war room for phased traffic restore.",
            typed: true,
          });

          teams.switchChannel("launch-war-room", "31.0s", "th_release_blocker");
          teams.at("31.5s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_sre",
            senderName: "Arjun",
            text: "Canary stable. Starting phased restore: 25% -> 50% -> 100%.",
          });
          teams.at("33.0s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_pm",
            senderName: "Priya",
            text: "Customer comms draft published in status channel.",
          });
          teams.at("34.0s").notify("n_launch_3", "Traffic restore in progress", 150);

          teams.switchChannel("customer-comms", "35.0s", "th_status_page");
          teams.at("35.3s").channelPost({
            channelId: "customer-comms",
            threadId: "th_status_page",
            senderId: "u_comms",
            senderName: "Ananya",
            text: "Status page updated: elevated latency under mitigation.",
            typed: true,
          });
          teams.at("36.8s").channelReply({
            channelId: "customer-comms",
            threadId: "th_status_page",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Include next update at T+30 with rollback outcome.",
          });

          teams.switchDm("dm_exec", "38.5s");
          teams.at("39.0s").dmSend({
            dmId: "dm_exec",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Canary healthy, phased restore underway. Next executive update in 15 min.",
            typed: true,
          });

          teams.switchChannel("launch-war-room", "41.0s", "th_release_blocker");
          teams.at("41.3s").startCall({
            callId: "call_war_room_02",
            participantIds: ["u_me", "u_pm", "u_sre", "u_backend", "u_exec"],
            scope: "channel",
            channelId: "launch-war-room",
          });
          teams.at("42.0s").setPresence("u_exec", "busy");
          teams.at("45.5s").endCall("call_war_room_02");

          teams.at("46.2s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_backend",
            senderName: "Maya",
            text: "All clusters green. Latency back to baseline.",
          });
          teams.at("47.0s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Declaring incident mitigated. Preparing RCA timeline and follow-ups.",
            typed: true,
          });

          teams.switchChannel("postmortems", "49.0s", "th_inc_2026_02_24");
          teams.at("49.5s").channelPost({
            channelId: "postmortems",
            threadId: "th_inc_2026_02_24",
            senderId: "u_me",
            senderName: "Nishit",
            text: "RCA thread started. Contribute facts only, no assumptions.",
            typed: true,
          });
          teams.at("50.8s").channelReply({
            channelId: "postmortems",
            threadId: "th_inc_2026_02_24",
            senderId: "u_sre",
            senderName: "Arjun",
            text: "Primary trigger: config drift in traffic policy rollout.",
          });
          teams.at("52.0s").channelReply({
            channelId: "postmortems",
            threadId: "th_inc_2026_02_24",
            senderId: "u_backend",
            senderName: "Maya",
            text: "Contributing factor: missing query plan guard in staging parity test.",
          });
          teams.at("53.0s").notify("n_pm_1", "Postmortem thread started", 180);

          teams.switchDm("dm_design", "54.5s");
          teams.at("55.0s").dmReceive({
            dmId: "dm_design",
            fromId: "u_design",
            fromName: "Rhea",
            text: "Do we delay the launch banner experiment?",
          });
          teams.at("56.0s").dmSend({
            dmId: "dm_design",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Yes, defer by 24h. We keep blast radius low after incident.",
            typed: true,
          });

          teams.switchChannel("launch-war-room", "58.0s", "th_release_blocker");
          teams.at("58.2s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_pm",
            senderName: "Priya",
            text: "Final status: stable for 20m, customer impact resolved.",
          });
          teams.at("59.0s").channelReply({
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Closing war room. Follow-up in #postmortems and #eng-alerts.",
            typed: true,
          });

          teams.at("60.0s").setPresence("u_me", "available");
          teams.at("60.2s").setPresence("u_pm", "available");
          teams.at("60.4s").setPresence("u_sre", "away");
          teams.at("60.6s").setPresence("u_exec", "available");

          teams.switchChannel("eng-alerts", "62.0s", "th_ci_failures");
          teams.at("62.5s").channelReply({
            channelId: "eng-alerts",
            threadId: "th_ci_failures",
            senderId: "u_ci",
            senderName: "CI Bot",
            text: "Pipeline green after fix. All required checks passed.",
          });
          teams.at("63.5s").notify("n_ci_2", "CI recovered and release gates green", 180);

          teams.switchDm("dm_exec", "65.0s");
          teams.at("65.3s").dmSend({
            dmId: "dm_exec",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Incident resolved. Sending full summary + action items before EOD.",
            typed: true,
          });
          teams.at("66.5s").dmReceive({
            dmId: "dm_exec",
            fromId: "u_exec",
            fromName: "Rohan (Exec)",
            text: "Good containment. Prioritize prevention over velocity this week.",
          });

          teams.openChatList("68.0s");
          teams.switchChannel("postmortems", "70.0s", "th_inc_2026_02_24");
          teams.at("70.5s").channelReply({
            channelId: "postmortems",
            threadId: "th_inc_2026_02_24",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Action items assigned with owners + deadlines. Tracking starts now.",
            typed: true,
          });
          teams.at("72.0s").notify("n_rca_1", "RCA action items assigned", 150);

          teams.openChatList("74.0s");
          teams.switchDm("dm_sre", "76.0s");
          teams.at("76.5s").dmSend({
            dmId: "dm_sre",
            senderId: "u_me",
            senderName: "Nishit",
            text: "Thanks for sharp execution today. Log learnings while fresh.",
            typed: true,
          });
          teams.at("78.0s").dmReceive({
            dmId: "dm_sre",
            fromId: "u_sre",
            fromName: "Arjun",
            text: "Will do. Drafting guardrail proposal now.",
          });

          teams.openChatList("80.0s");
          teams.at("82.0s").notify("n_wrap", "Showcase complete: enterprise workflow validated", 180);
          teams.openChatList("88.0s");
        },
      )
      .build(),
});
