import { LayoutContext, StoryLayoutState, StoryItemLayout } from "../types";

interface StoryUser {
  username: string;
  stories: Array<{ id: string }>;
}

interface StoriesAppState {
  activeStoryId?: string;
  users: StoryUser[];
}

export function computeStoryLayout(ctx: LayoutContext): StoryLayoutState {
  const { world, t, activeAppId, config } = ctx;
  const storyConfig = config?.story;
  if (!storyConfig) {
    return {
      kind: "STORY",
      activeStoryIndex: 0,
      storyCount: 0,
      storyProgress: 0,
      storyLayouts: [],
    };
  }

  const appState = world.appState?.[activeAppId] as
    | { stories?: StoriesAppState }
    | undefined;
  const activeStoryId = ctx.activeStoryId || appState?.stories?.activeStoryId;

  let stories: Array<{ id: string }> = [];

  if (activeStoryId) {
    const username = activeStoryId.split(":")[0];
    const user = appState?.stories?.users.find((u) => u.username === username);
    if (user) {
      stories = user.stories;
    }
  } else if (
    appState?.stories?.users?.length &&
    appState.stories.users.length > 0
  ) {
    stories = appState.stories.users[0].stories;
  }

  const storyCount = stories.length;
  if (storyCount === 0) {
    return {
      kind: "STORY",
      activeStoryIndex: 0,
      storyCount: 0,
      storyProgress: 0,
      storyLayouts: [],
    };
  }

  const totalDuration = storyCount * storyConfig.defaultStoryDuration;
  const effectiveT = Math.max(0, Math.min(t, totalDuration - 1));

  const activeStoryIndex = Math.floor(
    effectiveT / storyConfig.defaultStoryDuration,
  );
  const timeInStory = effectiveT % storyConfig.defaultStoryDuration;
  const storyProgress = timeInStory / storyConfig.defaultStoryDuration;

  const storyLayouts: StoryItemLayout[] = stories.map((story, index) => {
    let opacity = 0;
    let scale = 1;
    let translateX = 0;

    if (index === activeStoryIndex) {
      opacity = 1;
      scale = 1 + storyProgress * 0.05;
    } else if (index < activeStoryIndex) {
      opacity = 0;
      translateX = -100;
    } else {
      opacity = 0;
      translateX = 100;
    }

    return {
      id: story.id,
      index,
      translateX,
      translateY: 0,
      scale,
      opacity,
    };
  });

  return {
    kind: "STORY",
    activeStoryIndex,
    storyCount,
    storyProgress,
    storyLayouts,
  };
}
