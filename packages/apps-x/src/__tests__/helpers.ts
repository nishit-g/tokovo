import {
  DEFAULT_OS_STATE,
  createDefaultAudioState,
  type RuntimeEvent,
  type WorldState,
} from "@tokovo/core";
import { produce } from "immer";
import {
  createXInitialState,
  type XState,
  type XTweet,
  type XUser,
} from "../runtime/state.js";
import { xReducer } from "../runtime/reducer.js";

export const BASE_TIME = Date.UTC(2026, 6, 23, 10, 0, 0);

export function testUser(id: string, override: Partial<XUser> = {}): XUser {
  return {
    id,
    name: id === "u_me" ? "Mira Chen" : "Avery Stone",
    handle: id === "u_me" ? "mirac" : "averys",
    followers: 120,
    following: 80,
    followerIds: [],
    followingIds: [],
    verified: id === "u_other" ? "blue" : null,
    ...override,
  };
}

export function testTweet(id: string, override: Partial<XTweet> = {}): XTweet {
  return {
    id,
    authorId: "u_other",
    text: "A deterministic social post with enough copy to prove real wrapping.",
    createdAt: BASE_TIME - 60_000,
    hashtags: [],
    mentions: [],
    likeCount: 0,
    repostCount: 0,
    replyIds: [],
    likedBy: [],
    bookmarkedBy: [],
    sharedBy: [],
    viewCount: 1200,
    bookmarkCount: 0,
    shareCount: 0,
    ...override,
  };
}

export function createTestState(): XState {
  const state = createXInitialState();
  state.currentUserId = "u_me";
  state.usersById.u_me = testUser("u_me", { followingIds: ["u_other"] });
  state.usersById.u_other = testUser("u_other", { followerIds: ["u_me"] });
  state.tweetsById.tw_1 = testTweet("tw_1");
  state.timelineIds = ["tw_1"];
  state.dmThreadsById.dm_1 = {
    id: "dm_1",
    participantIds: ["u_me", "u_other"],
    messageIds: ["msg_1"],
    unreadCount: 0,
    pinned: false,
    typingUserIds: [],
    lastMessageAt: BASE_TIME - 30_000,
  };
  state.dmThreadIds = ["dm_1"];
  state.dmMessagesById.msg_1 = {
    id: "msg_1",
    threadId: "dm_1",
    senderId: "u_other",
    text: "The first cut is ready.",
    createdAt: BASE_TIME - 30_000,
    reactions: [],
    delivery: "read",
  };
  state.scroll.threadFromBottomById.dm_1 = 0;
  return state;
}

export function createTestWorld(state = createTestState()): WorldState {
  return {
    appInstances: { "phone:app_x": state },
    capabilityState: {},
    devices: {
      phone: {
        id: "phone",
        profileId: "iphone16",
        isLocked: false,
        foregroundAppId: "app_x",
        os: { ...DEFAULT_OS_STATE, clock: BASE_TIME, appearance: "dark" },
      },
    },
    audio: createDefaultAudioState(),
  } as WorldState;
}

export function reduce(world: WorldState, event: RuntimeEvent): WorldState {
  return produce(world, (draft) => {
    xReducer(draft, event as Parameters<typeof xReducer>[1]);
  });
}

export function appEvent(type: string, payload: unknown, at = 1): RuntimeEvent {
  return {
    at,
    kind: "APP",
    deviceId: "phone",
    appId: "app_x",
    type,
    payload,
  } as RuntimeEvent;
}
