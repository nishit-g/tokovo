import { describe, expect, it } from "vitest";
import { xBootstrap, type XInitialView, type XSnapshot } from "../bootstrap.js";
import { createXInitialState } from "../runtime/state.js";
import { BASE_TIME } from "./helpers.js";

function snapshot(override: Partial<XSnapshot> = {}): XSnapshot {
  return {
    schemaVersion: 2,
    locale: "en-US",
    currentUserId: "u_me",
    users: [
      { id: "u_me", name: "Mira", handle: "mira" },
      { id: "u_other", name: "Avery", handle: "avery", verified: "blue" },
    ],
    tweets: [
      { id: "tw_1", authorId: "u_other", text: "Canonical.", createdAt: BASE_TIME },
    ],
    threads: [
      { id: "dm_1", participantIds: ["u_me", "u_other"] },
    ],
    messages: [
      { id: "msg_1", threadId: "dm_1", senderId: "u_other", text: "Ready.", createdAt: BASE_TIME },
    ],
    ...override,
  };
}

function context(data?: XSnapshot, view?: XInitialView) {
  return {
    appId: "app_x" as const,
    deviceId: "phone",
    device: { id: "phone", app: "app_x", profile: "iphone16" } as never,
    ir: { id: "x-test", devices: [], timeline: [] } as never,
    baseState: createXInitialState(),
    snapshot: data ? {
      appId: "app_x" as const,
      deviceId: "phone",
      snapshotVersion: 2,
      snapshot: data,
    } : undefined,
    initialView: view ? {
      appId: "app_x" as const,
      deviceId: "phone",
      viewVersion: 2,
      view,
    } : undefined,
  };
}

describe("X VNext bootstrap", () => {
  it("hydrates an installed app without seeded data as canonical empty V2 state", () => {
    const hydrate = xBootstrap.hydrate;
    if (!hydrate) throw new Error("X_TEST_BOOTSTRAP_HYDRATE_MISSING");
    const state = hydrate(context(undefined, undefined));
    expect(state).toMatchObject({
      schemaVersion: 2,
      usersById: {},
      tweetsById: {},
      timelineIds: [],
      route: { screen: "timeline" },
    });
  });
  it("requires schema version 2 and explicit epoch timestamps", () => {
    const validate = xBootstrap.snapshot?.validate;
    if (!validate) throw new Error("X_TEST_SNAPSHOT_VALIDATOR_MISSING");
    expect(validate({ appId: "app_x", deviceId: "phone", value: { users: [] } } as never).errors ?? []).toEqual(
      expect.arrayContaining([expect.stringMatching(/schemaVersion/)]),
    );
    expect(validate({
      appId: "app_x",
      deviceId: "phone",
      value: {
        schemaVersion: 2,
        users: [{ id: "u", name: "User", handle: "user" }],
        tweets: [{ id: "tw", authorId: "u", text: "bad", createdAt: 30 }],
      },
    } as never).errors?.join(" ") ?? "").toMatch(/epoch milliseconds/);
  });

  it("rejects duplicate IDs and cross-entity reference failures", () => {
    const data = snapshot({
      users: [
        { id: "u_me", name: "Mira", handle: "mira" },
        { id: "u_me", name: "Duplicate", handle: "duplicate" },
      ],
      tweets: [{ id: "tw_1", authorId: "ghost", text: "Bad", createdAt: BASE_TIME }],
    });
    const result = xBootstrap.validate?.(context(data) as never);
    expect((result?.errors ?? []).join(" ")).toMatch(/duplicates "u_me"/);
    expect((result?.errors ?? []).join(" ")).toMatch(/unknown user "ghost"/);
  });

  it("hydrates authoring arrays into one normalized canonical state", () => {
    const hydrate = xBootstrap.hydrate;
    if (!hydrate) throw new Error("X_TEST_BOOTSTRAP_HYDRATE_MISSING");
    const state = hydrate(context(snapshot(), {
      schemaVersion: 2,
      screen: "thread",
      threadId: "dm_1",
    }) as never);
    expect(state).toMatchObject({
      schemaVersion: 2,
      viewMode: "CHAT",
      conversationId: "dm_1",
      route: { screen: "thread", threadId: "dm_1" },
      timelineIds: ["tw_1"],
      dmThreadIds: ["dm_1"],
    });
    expect(state.usersById.u_other.handle).toBe("avery");
    expect(state.dmThreadsById.dm_1.messageIds).toEqual(["msg_1"]);
    expect(state.dmMessagesById.msg_1.delivery).toBe("sent");
  });

  it("requires route-specific targets in initial views", () => {
    const result = xBootstrap.view?.validate?.({
      appId: "app_x",
      deviceId: "phone",
      value: { schemaVersion: 2, screen: "tweet" },
    } as never);
    expect((result?.errors ?? []).join(" ")).toMatch(/requires tweetId/);
  });
});
