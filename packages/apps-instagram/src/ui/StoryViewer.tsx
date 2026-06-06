import React from "react";
import type { WorldState } from "@tokovo/core";
import { AppShell } from "./AppShell.js";
import { Avatar, Icon, ProgressBars } from "./components.js";
import { getActiveStory, getActiveStorySet, getStoriesForSet, getThreadDraft, getUserById } from "../runtime/selectors.js";

export const StoryViewer: React.FC<{ world: WorldState }> = ({ world }) => {
  const storySet = getActiveStorySet(world);
  const story = getActiveStory(world);
  const author = getUserById(world, story?.authorId ?? null);
  const stories = getStoriesForSet(world, storySet?.id ?? null);
  const appState = world.appState?.app_instagram;
  const replyThread =
    appState && typeof appState === "object" && "activeThreadId" in appState
      ? (appState as { activeThreadId?: string | null }).activeThreadId ?? null
      : null;
  const replyDraft = getThreadDraft(world, replyThread);

  return (
    <AppShell immersive>
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {story ? (
          <img
            src={story.mediaUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 18%, transparent 72%, rgba(0,0,0,0.45))",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, padding: 14, display: "flex", flexDirection: "column", height: "100%" }}>
          <ProgressBars items={stories} activeStoryId={story?.id ?? null} />
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar size={32} src={author?.avatarUrl} ring />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{author?.username ?? "unknown"}</div>
              <div style={{ fontSize: 12, opacity: 0.82 }}>Active story</div>
            </div>
            <Icon name="more" color="#FFFFFF" />
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingBottom: 18,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.32)",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                fontSize: 14,
                color: replyDraft ? "#FFFFFF" : "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
              }}
            >
              {replyDraft || "Reply to story"}
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="heart" color="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
