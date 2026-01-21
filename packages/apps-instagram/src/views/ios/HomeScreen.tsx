/**
 * Instagram Home Screen (iOS)
 *
 * Main feed with header, stories, and posts.
 * NOTE: Safe area top is handled by InstagramApp router.
 */

import React from "react";
import { instagramTheme } from "../../config/theme";
import { Header } from "./Header";
import { Stories } from "./Stories";
import { Post } from "./Post";
import { BottomNav } from "./BottomNav";
import type { InstagramPost, InstagramStory } from "../../types";

interface HomeScreenProps {
  feed: InstagramPost[];
  stories: InstagramStory[];
  width: number;
  height: number;
  safeAreaBottom?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  feed,
  stories,
  width,
  height,
  safeAreaBottom = 34,
}) => {
  const theme = instagramTheme;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Header />

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          paddingBottom: safeAreaBottom + theme.spacing.bottomNavHeight + 20,
        }}
      >
        {/* Stories */}
        <Stories stories={stories} />

        {/* Feed */}
        {feed.map((post) => (
          <Post key={post.id} post={post} />
        ))}

        {/* Empty state */}
        {feed.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: theme.colors.textSecondary,
              fontSize: 16,
            }}
          >
            No posts yet
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};
