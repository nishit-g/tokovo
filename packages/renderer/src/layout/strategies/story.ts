import { LayoutContext, StoryLayoutState, StoryItemLayout } from "../types";

export function computeStoryLayout(ctx: LayoutContext): StoryLayoutState {
    const { world, t, activeAppId, config } = ctx;
    const storyConfig = config!.story!;

    // Get stories from app state
    const appState = world.appState?.[activeAppId];
    // Find active user's stories
    // Heuristic: activeStoryId format "username:storyId"
    // Or just use the first user in the stories list for now if no ID
    const activeStoryId = ctx.activeStoryId || appState?.stories?.activeStoryId;

    let stories: any[] = [];
    let activeUserIndex = 0;

    if (activeStoryId) {
        const username = activeStoryId.split(':')[0];
        const user = appState?.stories?.users.find((u: any) => u.username === username);
        if (user) {
            stories = user.stories;
        }
    } else if (appState?.stories?.users?.length > 0) {
        // Fallback to first user
        stories = appState.stories.users[0].stories;
    }

    const storyCount = stories.length;
    if (storyCount === 0) {
        return {
            kind: "STORY",
            activeStoryIndex: 0,
            storyCount: 0,
            storyProgress: 0,
            storyLayouts: []
        };
    }

    // Calculate active index based on time
    // We assume t starts at 0 when the story view opens. 
    // In a real app, we might need a "startT" in the context or meta.
    // For now, let's assume global t maps to story progress.

    const totalDuration = storyCount * storyConfig.defaultStoryDuration;
    // Loop or clamp? Let's clamp.
    const effectiveT = Math.max(0, Math.min(t, totalDuration - 1));

    const activeStoryIndex = Math.floor(effectiveT / storyConfig.defaultStoryDuration);
    const timeInStory = effectiveT % storyConfig.defaultStoryDuration;
    const storyProgress = timeInStory / storyConfig.defaultStoryDuration;

    const storyLayouts: StoryItemLayout[] = stories.map((story: any, index: number) => {
        let opacity = 0;
        let scale = 1;
        let translateX = 0;

        if (index === activeStoryIndex) {
            opacity = 1;
            // Subtle zoom effect
            scale = 1 + (storyProgress * 0.05);
        } else if (index < activeStoryIndex) {
            // Previous story
            opacity = 0;
            translateX = -100; // Move left
        } else {
            // Next story
            opacity = 0;
            translateX = 100; // Move right
        }

        return {
            id: story.id,
            index,
            translateX,
            translateY: 0,
            scale,
            opacity
        };
    });

    return {
        kind: "STORY",
        activeStoryIndex,
        storyCount,
        storyProgress,
        storyLayouts
    };
}
