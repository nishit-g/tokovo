import { describe, expect, it } from "vitest";
import { requireXState } from "../runtime/selectors.js";
import { appEvent, BASE_TIME, createTestState, createTestWorld, reduce } from "./helpers.js";

describe("X VNext reducer", () => {
  it("creates canonical users and rejects duplicate entity creation", () => {
    const world = createTestWorld(createTestState());
    const payload = { id: "u_new", name: "Nova Reed", handle: "novareed" };
    const next = reduce(world, appEvent("ADD_USER", payload));
    expect(requireXState(next, "phone").usersById.u_new).toMatchObject({
      id: "u_new",
      followers: 0,
      followingIds: [],
    });
    expect(() => reduce(next, appEvent("ADD_USER", payload))).toThrow(/X_USER_DUPLICATE/);
  });

  it("rejects malformed timestamps instead of treating frames as Unix time", () => {
    const world = createTestWorld();
    expect(() =>
      reduce(
        world,
        appEvent("ADD_TWEET", {
          id: "tw_bad",
          authorId: "u_me",
          text: "bad timestamp",
          createdAt: 30,
        }),
      ),
    ).toThrow(/X_EVENT_PAYLOAD_INVALID.*epoch milliseconds/);
  });

  it("rejects missing references and duplicate tweets", () => {
    const world = createTestWorld();
    expect(() =>
      reduce(
        world,
        appEvent("ADD_TWEET", {
          id: "tw_missing_author",
          authorId: "ghost",
          text: "hello",
          createdAt: BASE_TIME,
        }),
      ),
    ).toThrow(/X_USER_MISSING/);
    expect(() =>
      reduce(
        world,
        appEvent("ADD_TWEET", {
          id: "tw_1",
          authorId: "u_me",
          text: "duplicate",
          createdAt: BASE_TIME,
        }),
      ),
    ).toThrow(/X_TWEET_DUPLICATE/);
  });

  it("maintains normalized reply and timeline indexes", () => {
    const world = createTestWorld();
    const reply = reduce(
      world,
      appEvent("ADD_TWEET", {
        id: "tw_reply",
        authorId: "u_me",
        text: "Ship it.",
        replyToId: "tw_1",
        createdAt: BASE_TIME,
      }),
    );
    const state = requireXState(reply, "phone");
    expect(state.tweetsById.tw_1.replyIds).toEqual(["tw_reply"]);
    expect(state.timelineIds).toEqual(["tw_1"]);

    const topLevel = reduce(
      reply,
      appEvent("ADD_TWEET", {
        id: "tw_new",
        authorId: "u_me",
        text: "New top-level post.",
        createdAt: BASE_TIME + 1_000,
      }),
    );
    expect(requireXState(topLevel, "phone").timelineIds).toEqual(["tw_new", "tw_1"]);
  });

  it("makes likes idempotent and validates both entities", () => {
    const world = createTestWorld();
    const once = reduce(world, appEvent("LIKE_TWEET", { tweetId: "tw_1", userId: "u_me" }));
    const twice = reduce(once, appEvent("LIKE_TWEET", { tweetId: "tw_1", userId: "u_me" }));
    expect(requireXState(twice, "phone").tweetsById.tw_1.likeCount).toBe(1);
    expect(() =>
      reduce(world, appEvent("LIKE_TWEET", { tweetId: "tw_1", userId: "ghost" })),
    ).toThrow(/X_USER_MISSING/);
  });

  it("supports reversible reactions without allowing counters below zero", () => {
    const world = createTestWorld();
    const liked = reduce(world, appEvent("LIKE_TWEET", { tweetId: "tw_1", userId: "u_me" }));
    const unliked = reduce(liked, appEvent("UNLIKE_TWEET", { tweetId: "tw_1", userId: "u_me" }));
    const repeated = reduce(unliked, appEvent("UNLIKE_TWEET", { tweetId: "tw_1", userId: "u_me" }));
    expect(requireXState(repeated, "phone").tweetsById.tw_1).toMatchObject({
      likeCount: 0,
      likedBy: [],
    });
  });

  it("models one deterministic poll selection for the current user", () => {
    const state = createTestState();
    state.tweetsById.tw_poll = {
      ...state.tweetsById.tw_1,
      id: "tw_poll",
      poll: {
        options: [
          { id: "a", label: "A", votes: 2 },
          { id: "b", label: "B", votes: 3 },
        ],
        totalVotes: 5,
        selectedOptionId: null,
      },
    };
    const world = createTestWorld(state);
    const voted = reduce(
      world,
      appEvent("VOTE_POLL", {
        tweetId: "tw_poll",
        userId: "u_me",
        optionId: "b",
      }),
    );
    expect(requireXState(voted, "phone").tweetsById.tw_poll.poll).toMatchObject({
      totalVotes: 6,
      selectedOptionId: "b",
      options: [{ votes: 2 }, { votes: 4 }],
    });
    expect(() =>
      reduce(
        voted,
        appEvent("VOTE_POLL", {
          tweetId: "tw_poll",
          userId: "u_me",
          optionId: "a",
        }),
      ),
    ).toThrow(/X_POLL_ALREADY_VOTED/);
  });

  it("tracks video, composer, and DM delivery lifecycles", () => {
    const state = createTestState();
    state.tweetsById.tw_1.media = {
      type: "video",
      urls: ["/media/demo.mp4"],
      aspect: "wide",
      sensitive: false,
      playback: { state: "idle", progress: 0 },
    };
    let world = createTestWorld(state);
    world = reduce(
      world,
      appEvent("SET_MEDIA_PLAYBACK", {
        tweetId: "tw_1",
        state: "playing",
        progress: 0.4,
      }),
    );
    world = reduce(
      world,
      appEvent("SET_COMPOSER_STATUS", {
        status: "failed",
        error: "Connection interrupted",
      }),
    );
    world = reduce(
      world,
      appEvent("ADD_DM_MESSAGE_OUTGOING", {
        id: "msg_outgoing",
        threadId: "dm_1",
        senderId: "u_me",
        text: "Retry me",
        createdAt: BASE_TIME,
        delivery: "sending",
      }),
    );
    world = reduce(
      world,
      appEvent("SET_DM_DELIVERY", {
        messageId: "msg_outgoing",
        delivery: "failed",
      }),
    );
    const next = requireXState(world, "phone");
    expect(next.tweetsById.tw_1.media?.playback).toMatchObject({
      state: "playing",
      progress: 0.4,
    });
    expect(next.composer).toEqual({
      draft: "",
      status: "failed",
      error: "Connection interrupted",
    });
    expect(next.dmMessagesById.msg_outgoing.delivery).toBe("failed");
  });

  it("validates route targets and keeps viewMode synchronized", () => {
    const world = createTestWorld();
    expect(() =>
      reduce(world, appEvent("SET_SCREEN", { screen: "tweet", tweetId: "ghost" })),
    ).toThrow(/X_TWEET_MISSING/);
    const thread = reduce(
      world,
      appEvent("SET_SCREEN", { screen: "thread", threadId: "dm_1" }, 12),
    );
    expect(requireXState(thread, "phone")).toMatchObject({
      route: { screen: "thread", threadId: "dm_1" },
      viewMode: "CHAT",
      conversationId: "dm_1",
    });
    const back = reduce(thread, appEvent("NAVIGATE_BACK", {}, 20));
    expect(requireXState(back, "phone").route).toEqual({ screen: "timeline" });
  });

  it("requires DM senders to belong to the target thread", () => {
    const world = createTestWorld();
    const withOutsider = reduce(
      world,
      appEvent("ADD_USER", { id: "u_out", name: "Out", handle: "out" }),
    );
    expect(() =>
      reduce(
        withOutsider,
        appEvent("ADD_DM_MESSAGE_INCOMING", {
          id: "msg_out",
          threadId: "dm_1",
          senderId: "u_out",
          text: "Nope",
          createdAt: BASE_TIME,
        }),
      ),
    ).toThrow(/X_THREAD_PARTICIPANT_REQUIRED/);
  });

  it("increments unread only for incoming messages on inactive threads", () => {
    const world = createTestWorld();
    const next = reduce(
      world,
      appEvent("ADD_DM_MESSAGE_INCOMING", {
        id: "msg_2",
        threadId: "dm_1",
        senderId: "u_other",
        text: "Are you there?",
        createdAt: BASE_TIME,
      }),
    );
    expect(requireXState(next, "phone").dmThreadsById.dm_1.unreadCount).toBe(1);
  });

  it("separates incoming and outgoing identity semantics and clears submitted drafts", () => {
    const state = createTestState();
    state.threadDrafts.dm_1 = "Ship it";
    const world = createTestWorld(state);
    expect(() =>
      reduce(
        world,
        appEvent("ADD_DM_MESSAGE_OUTGOING", {
          id: "msg_wrong_out",
          threadId: "dm_1",
          senderId: "u_other",
          text: "wrong direction",
          createdAt: BASE_TIME,
        }),
      ),
    ).toThrow(/X_DM_OUTGOING_SENDER_INVALID/);
    expect(() =>
      reduce(
        world,
        appEvent("ADD_DM_MESSAGE_INCOMING", {
          id: "msg_wrong_in",
          threadId: "dm_1",
          senderId: "u_me",
          text: "wrong direction",
          createdAt: BASE_TIME,
        }),
      ),
    ).toThrow(/X_DM_INCOMING_SENDER_INVALID/);
    expect(() =>
      reduce(
        world,
        appEvent("ADD_DM_MESSAGE_INCOMING", {
          id: "msg_wrong_delivery",
          threadId: "dm_1",
          senderId: "u_other",
          text: "incoming messages do not send",
          createdAt: BASE_TIME,
          delivery: "sending",
        }),
      ),
    ).toThrow(/X_DM_INCOMING_DELIVERY_INVALID/);

    const sent = reduce(
      world,
      appEvent("ADD_DM_MESSAGE_OUTGOING", {
        id: "msg_sent",
        threadId: "dm_1",
        senderId: "u_me",
        text: "Ship it",
        createdAt: BASE_TIME,
      }),
    );
    expect(requireXState(sent, "phone")).toMatchObject({
      threadDrafts: { dm_1: "" },
      dmMessagesById: { msg_sent: { delivery: "sent", reactions: [] } },
    });
    expect(requireXState(sent, "phone").dmThreadsById.dm_1.unreadCount).toBe(0);
  });

  it("models concurrent typing participants and stops a sender when their message arrives", () => {
    const state = createTestState();
    state.usersById.u_third = {
      ...state.usersById.u_other,
      id: "u_third",
      name: "Jordan Lee",
      handle: "jordan",
    };
    state.dmThreadsById.dm_1.participantIds.push("u_third");
    let world = createTestWorld(state);
    expect(() =>
      reduce(world, appEvent("START_DM_TYPING", { threadId: "dm_1", userId: "u_me" })),
    ).toThrow(/X_DM_TYPING_CURRENT_USER_INVALID/);
    world = reduce(world, appEvent("START_DM_TYPING", { threadId: "dm_1", userId: "u_other" }));
    world = reduce(world, appEvent("START_DM_TYPING", { threadId: "dm_1", userId: "u_third" }));
    expect(requireXState(world, "phone").dmThreadsById.dm_1.typingUserIds).toEqual([
      "u_other",
      "u_third",
    ]);
    world = reduce(
      world,
      appEvent("ADD_DM_MESSAGE_INCOMING", {
        id: "msg_typing_done",
        threadId: "dm_1",
        senderId: "u_other",
        text: "Here it is",
        createdAt: BASE_TIME,
      }),
    );
    expect(requireXState(world, "phone").dmThreadsById.dm_1.typingUserIds).toEqual(["u_third"]);
  });

  it("validates DM replies and applies reactions idempotently", () => {
    let world = createTestWorld();
    world = reduce(
      world,
      appEvent("ADD_DM_MESSAGE_OUTGOING", {
        id: "msg_reply",
        threadId: "dm_1",
        senderId: "u_me",
        text: "Replying",
        replyToMessageId: "msg_1",
        createdAt: BASE_TIME,
      }),
    );
    world = reduce(
      world,
      appEvent("ADD_DM_REACTION", {
        messageId: "msg_reply",
        userId: "u_other",
        emoji: "🔥",
      }),
    );
    world = reduce(
      world,
      appEvent("ADD_DM_REACTION", {
        messageId: "msg_reply",
        userId: "u_other",
        emoji: "🔥",
      }),
    );
    expect(requireXState(world, "phone").dmMessagesById.msg_reply).toMatchObject({
      replyToMessageId: "msg_1",
      reactions: [{ emoji: "🔥", userIds: ["u_other"] }],
    });
    world = reduce(
      world,
      appEvent("REMOVE_DM_REACTION", {
        messageId: "msg_reply",
        userId: "u_other",
        emoji: "🔥",
      }),
    );
    expect(requireXState(world, "phone").dmMessagesById.msg_reply.reactions).toEqual([]);
  });

  it("enforces forward outgoing delivery transitions", () => {
    let world = createTestWorld();
    world = reduce(
      world,
      appEvent("ADD_DM_MESSAGE_OUTGOING", {
        id: "msg_delivery",
        threadId: "dm_1",
        senderId: "u_me",
        text: "Track the receipt",
        createdAt: BASE_TIME,
        delivery: "sending",
      }),
    );
    for (const delivery of ["sent", "delivered", "read"] as const) {
      world = reduce(world, appEvent("SET_DM_DELIVERY", { messageId: "msg_delivery", delivery }));
    }
    expect(requireXState(world, "phone").dmMessagesById.msg_delivery.delivery).toBe("read");
    expect(() =>
      reduce(
        world,
        appEvent("SET_DM_DELIVERY", {
          messageId: "msg_delivery",
          delivery: "sent",
        }),
      ),
    ).toThrow(/X_DM_DELIVERY_TRANSITION_INVALID/);
    expect(() =>
      reduce(
        world,
        appEvent("SET_DM_DELIVERY", {
          messageId: "msg_1",
          delivery: "failed",
        }),
      ),
    ).toThrow(/X_DM_DELIVERY_DIRECTION_INVALID/);
  });

  it("stores independent authored scroll positions and rejects missing targets", () => {
    let world = createTestWorld();
    world = reduce(world, appEvent("SET_SCROLL", { surface: "timeline", offset: 240 }));
    world = reduce(
      world,
      appEvent("SET_SCROLL", {
        surface: "tweet",
        targetId: "tw_1",
        offset: 160,
      }),
    );
    world = reduce(
      world,
      appEvent("SET_SCROLL", {
        surface: "thread",
        targetId: "dm_1",
        offset: 90,
      }),
    );
    expect(requireXState(world, "phone").scroll).toMatchObject({
      timeline: 240,
      tweetById: { tw_1: 160 },
      threadFromBottomById: { dm_1: 90 },
    });
    expect(() =>
      reduce(
        world,
        appEvent("SET_SCROLL", {
          surface: "profile",
          targetId: "ghost",
          offset: 1,
        }),
      ),
    ).toThrow(/X_USER_MISSING/);
  });

  it("refuses non-canonical runtime state instead of repairing it", () => {
    const state = createTestState() as unknown as Record<string, unknown>;
    delete state.schemaVersion;
    const world = createTestWorld(state as never);
    expect(() => reduce(world, appEvent("SET_COMPOSE_DRAFT", { text: "x" }))).toThrow(
      /X_STATE_VERSION_UNSUPPORTED/,
    );
  });
});
