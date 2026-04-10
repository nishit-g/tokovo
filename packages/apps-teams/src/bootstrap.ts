import {
  expectArray,
  expectObjectRecord,
  expectOneOf,
  expectOptionalString,
  expectString,
} from "@tokovo/core";
import type {
  PluginBootstrapContract,
  PluginBootstrapSchemaContext,
  PluginBootstrapValidationResult,
} from "@tokovo/core";
import {
  TEAMS_LIST_FILTERS,
  TEAMS_SCREENS,
  TEAMS_TABS,
} from "./constants.js";
import type {
  TeamsCall,
  TeamsChannel,
  TeamsDm,
  TeamsDraft,
  TeamsMessage,
  TeamsNotification,
  TeamsPresence,
  TeamsState,
  TeamsThread,
  TeamsTypingState,
  TeamsUiState,
  TeamsUser,
} from "./types/index.js";
import { createTeamsInitialState } from "./runtime/initial-state.js";
import { syncViewMode, targetKey } from "./handlers/shared.js";

type TeamsMessageInput = Omit<TeamsMessage, "createdAtFrame"> & {
  createdAtFrame?: number;
};

type TeamsNotificationInput = Omit<
  TeamsNotification,
  "appId" | "createdAtFrame" | "expiresAtFrame"
> & {
  createdAtFrame?: number;
  expiresAtFrame?: number;
};

type TeamsDraftInput = Omit<TeamsDraft, "updatedAtFrame"> & {
  updatedAtFrame?: number;
};

type TeamsTypingInput = Omit<TeamsTypingState, "startedAtFrame"> & {
  startedAtFrame?: number;
};

type TeamsCallInput = Omit<TeamsCall, "startedAtFrame" | "endedAtFrame"> & {
  startedAtFrame?: number;
  endedAtFrame?: number;
};

export interface TeamsSnapshot {
  users?: TeamsUser[];
  dms?: TeamsDm[];
  channels?: TeamsChannel[];
  threads?: TeamsThread[];
  messages?: TeamsMessageInput[];
  notifications?: TeamsNotificationInput[];
  drafts?: TeamsDraftInput[];
  typing?: TeamsTypingInput[];
  presence?: Record<string, TeamsPresence>;
  calls?: TeamsCallInput[];
}

export interface TeamsInitialView {
  screen: TeamsState["screen"];
  activeListFilter?: TeamsUiState["activeListFilter"];
  activeTab?: TeamsUiState["activeTab"];
  activeDmId?: string;
  activeChannelId?: string;
  activeThreadId?: string;
  activeCallId?: string;
}

function validateTeamsSnapshot(
  input: PluginBootstrapSchemaContext<"app_teams">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const snapshot = expectObjectRecord(input.value, "snapshot", errors);
  if (!snapshot) {
    return { errors };
  }

  const userIds = new Set<string>();
  const dmIds = new Set<string>();
  const channelIds = new Set<string>();
  const threadIds = new Set<string>();

  const users = snapshot.users == null
    ? undefined
    : expectArray(snapshot.users, "snapshot.users", errors);
  users?.forEach((value, index) => {
    const user = expectObjectRecord(value, `snapshot.users[${index}]`, errors);
    if (!user) return;
    const id = expectString(user.id, `snapshot.users[${index}].id`, errors);
    expectString(user.displayName, `snapshot.users[${index}].displayName`, errors);
    if (id) {
      if (userIds.has(id)) errors.push(`snapshot.users[${index}].id duplicates "${id}"`);
      userIds.add(id);
    }
  });

  const dms = snapshot.dms == null
    ? undefined
    : expectArray(snapshot.dms, "snapshot.dms", errors);
  dms?.forEach((value, index) => {
    const dm = expectObjectRecord(value, `snapshot.dms[${index}]`, errors);
    if (!dm) return;
    const id = expectString(dm.id, `snapshot.dms[${index}].id`, errors);
    const participantIds = expectArray(
      dm.participantIds,
      `snapshot.dms[${index}].participantIds`,
      errors,
    );
    participantIds?.forEach((participantId, participantIndex) => {
      const resolved = expectString(
        participantId,
        `snapshot.dms[${index}].participantIds[${participantIndex}]`,
        errors,
      );
      if (resolved && userIds.size > 0 && !userIds.has(resolved)) {
        errors.push(`snapshot.dms[${index}].participantIds[${participantIndex}] references unknown user "${resolved}"`);
      }
    });
    if (id) {
      if (dmIds.has(id)) errors.push(`snapshot.dms[${index}].id duplicates "${id}"`);
      dmIds.add(id);
    }
  });

  const channels = snapshot.channels == null
    ? undefined
    : expectArray(snapshot.channels, "snapshot.channels", errors);
  channels?.forEach((value, index) => {
    const channel = expectObjectRecord(value, `snapshot.channels[${index}]`, errors);
    if (!channel) return;
    const id = expectString(channel.id, `snapshot.channels[${index}].id`, errors);
    expectString(channel.name, `snapshot.channels[${index}].name`, errors);
    if (id) {
      if (channelIds.has(id)) errors.push(`snapshot.channels[${index}].id duplicates "${id}"`);
      channelIds.add(id);
    }
  });

  const threads = snapshot.threads == null
    ? undefined
    : expectArray(snapshot.threads, "snapshot.threads", errors);
  threads?.forEach((value, index) => {
    const thread = expectObjectRecord(value, `snapshot.threads[${index}]`, errors);
    if (!thread) return;
    const id = expectString(thread.id, `snapshot.threads[${index}].id`, errors);
    if (typeof thread.channelId === "string" && channelIds.size > 0 && !channelIds.has(thread.channelId)) {
      errors.push(`snapshot.threads[${index}].channelId references unknown channel "${thread.channelId}"`);
    }
    if (typeof thread.dmId === "string" && dmIds.size > 0 && !dmIds.has(thread.dmId)) {
      errors.push(`snapshot.threads[${index}].dmId references unknown dm "${thread.dmId}"`);
    }
    if (id) {
      if (threadIds.has(id)) errors.push(`snapshot.threads[${index}].id duplicates "${id}"`);
      threadIds.add(id);
    }
  });

  const messages = snapshot.messages == null
    ? undefined
    : expectArray(snapshot.messages, "snapshot.messages", errors);
  messages?.forEach((value, index) => {
    const message = expectObjectRecord(value, `snapshot.messages[${index}]`, errors);
    if (!message) return;
    expectString(message.id, `snapshot.messages[${index}].id`, errors);
    const senderId = expectString(message.senderId, `snapshot.messages[${index}].senderId`, errors);
    expectString(message.senderName, `snapshot.messages[${index}].senderName`, errors);
    expectString(message.text, `snapshot.messages[${index}].text`, errors);
    expectOneOf(
      message.kind,
      ["text", "system"],
      `snapshot.messages[${index}].kind`,
      errors,
    );
    expectOneOf(
      message.status,
      ["sending", "sent", "delivered", "read"],
      `snapshot.messages[${index}].status`,
      errors,
    );
    const target = expectObjectRecord(message.target, `snapshot.messages[${index}].target`, errors);
    if (target) {
      const targetKind = expectOneOf(
        target.kind,
        ["dm", "thread"],
        `snapshot.messages[${index}].target.kind`,
        errors,
      );
      if (targetKind === "dm") {
        const dmId = expectString(target.dmId, `snapshot.messages[${index}].target.dmId`, errors);
        if (dmId && dmIds.size > 0 && !dmIds.has(dmId)) {
          errors.push(`snapshot.messages[${index}].target.dmId references unknown dm "${dmId}"`);
        }
      }
      if (targetKind === "thread") {
        const channelId = expectString(
          target.channelId,
          `snapshot.messages[${index}].target.channelId`,
          errors,
        );
        const threadId = expectString(
          target.threadId,
          `snapshot.messages[${index}].target.threadId`,
          errors,
        );
        if (channelId && channelIds.size > 0 && !channelIds.has(channelId)) {
          errors.push(`snapshot.messages[${index}].target.channelId references unknown channel "${channelId}"`);
        }
        if (threadId && threadIds.size > 0 && !threadIds.has(threadId)) {
          errors.push(`snapshot.messages[${index}].target.threadId references unknown thread "${threadId}"`);
        }
      }
    }
    if (senderId && userIds.size > 0 && !userIds.has(senderId)) {
      errors.push(`snapshot.messages[${index}].senderId references unknown user "${senderId}"`);
    }
  });

  return { errors };
}

function validateTeamsInitialView(
  input: PluginBootstrapSchemaContext<"app_teams">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(input.value, "initialView", errors);
  if (!view) {
    return { errors };
  }

  expectOneOf(
    view.screen,
    Object.values(TEAMS_SCREENS),
    "initialView.screen",
    errors,
  );
  if (view.activeListFilter != null) {
    expectOneOf(
      view.activeListFilter,
      Object.values(TEAMS_LIST_FILTERS),
      "initialView.activeListFilter",
      errors,
    );
  }
  if (view.activeTab != null) {
    expectOneOf(
      view.activeTab,
      Object.values(TEAMS_TABS),
      "initialView.activeTab",
      errors,
    );
  }
  expectOptionalString(view.activeDmId, "initialView.activeDmId", errors);
  expectOptionalString(view.activeChannelId, "initialView.activeChannelId", errors);
  expectOptionalString(view.activeThreadId, "initialView.activeThreadId", errors);
  expectOptionalString(view.activeCallId, "initialView.activeCallId", errors);

  return { errors };
}

function cloneDm(dm: TeamsDm): TeamsDm {
  return {
    ...dm,
    participantIds: [...dm.participantIds],
    messageIds: [...dm.messageIds],
    unreadCount: dm.unreadCount ?? 0,
    mentionCount: dm.mentionCount ?? 0,
  };
}

function cloneChannel(channel: TeamsChannel): TeamsChannel {
  return {
    ...channel,
    memberIds: [...channel.memberIds],
    threadIds: [...channel.threadIds],
    unreadCount: channel.unreadCount ?? 0,
    mentionCount: channel.mentionCount ?? 0,
  };
}

function cloneThread(thread: TeamsThread): TeamsThread {
  return {
    ...thread,
    participantIds: [...thread.participantIds],
    messageIds: [...thread.messageIds],
    typingUserIds: [...thread.typingUserIds],
    unreadCount: thread.unreadCount ?? 0,
    mentionCount: thread.mentionCount ?? 0,
    replyCount: thread.replyCount ?? 0,
    state: thread.state ?? "open",
  };
}

function cloneMessage(message: TeamsMessageInput): TeamsMessage {
  return {
    ...message,
    createdAtFrame: message.createdAtFrame ?? 0,
    mentionedUserIds: [...message.mentionedUserIds],
  };
}

function cloneNotification(notification: TeamsNotificationInput): TeamsNotification {
  return {
    ...notification,
    appId: "app_teams",
    createdAtFrame: notification.createdAtFrame ?? 0,
    expiresAtFrame:
      notification.expiresAtFrame ??
      (notification.createdAtFrame ?? 0) + 180,
  };
}

function cloneDraft(draft: TeamsDraftInput): TeamsDraft {
  return {
    ...draft,
    updatedAtFrame: draft.updatedAtFrame ?? 0,
  };
}

function cloneTyping(typing: TeamsTypingInput): TeamsTypingState {
  return {
    ...typing,
    userIds: [...typing.userIds],
    startedAtFrame: typing.startedAtFrame ?? 0,
  };
}

function cloneCall(call: TeamsCallInput): TeamsCall {
  return {
    ...call,
    participantIds: [...call.participantIds],
    startedAtFrame: call.startedAtFrame,
    endedAtFrame: call.endedAtFrame,
  };
}

function applyInitialView(state: TeamsState, initialView?: TeamsInitialView): void {
  state.ui.activeListFilter =
    initialView?.activeListFilter ?? state.ui.activeListFilter ?? TEAMS_LIST_FILTERS.ALL;
  state.ui.activeTab =
    initialView?.activeTab ?? state.ui.activeTab ?? TEAMS_TABS.CHAT;

  if (!initialView) {
    syncViewMode(state);
    return;
  }

  state.screen = initialView.screen;
  state.activeDmId = initialView.activeDmId;
  state.activeChannelId = initialView.activeChannelId;
  state.activeThreadId = initialView.activeThreadId;
  state.activeCallId = initialView.activeCallId;
  state.ui.surface = initialView.screen;
  syncViewMode(state);
}

export const teamsBootstrap: PluginBootstrapContract<"app_teams"> = {
  snapshot: {
    currentVersion: 1,
    validate: validateTeamsSnapshot,
  },
  view: {
    currentVersion: 1,
    validate: validateTeamsInitialView,
  },
  validate(context): PluginBootstrapValidationResult {
    const snapshot = (context.snapshot?.snapshot as TeamsSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as TeamsInitialView | undefined;
    const errors: string[] = [];
    const dmIds = new Set((snapshot.dms ?? []).map((dm) => dm.id));
    const channelIds = new Set((snapshot.channels ?? []).map((channel) => channel.id));
    const threadIds = new Set((snapshot.threads ?? []).map((thread) => thread.id));
    const callIds = new Set((snapshot.calls ?? []).map((call) => call.id));

    if (initialView?.activeDmId && !dmIds.has(initialView.activeDmId)) {
      errors.push(`initialView.activeDmId references unknown dm "${initialView.activeDmId}"`);
    }
    if (initialView?.activeChannelId && !channelIds.has(initialView.activeChannelId)) {
      errors.push(`initialView.activeChannelId references unknown channel "${initialView.activeChannelId}"`);
    }
    if (initialView?.activeThreadId && !threadIds.has(initialView.activeThreadId)) {
      errors.push(`initialView.activeThreadId references unknown thread "${initialView.activeThreadId}"`);
    }
    if (initialView?.activeCallId && !callIds.has(initialView.activeCallId)) {
      errors.push(`initialView.activeCallId references unknown call "${initialView.activeCallId}"`);
    }

    return { errors };
  },
  hydrate(context): TeamsState {
    const snapshot = (context.snapshot?.snapshot as TeamsSnapshot | undefined) ?? {};
    const initialView = context.initialView?.view as TeamsInitialView | undefined;
    const baseState = context.baseState as TeamsState;
    const state: TeamsState = {
      ...createTeamsInitialState(),
      ...baseState,
      ui: {
        ...createTeamsInitialState().ui,
        ...(baseState?.ui ?? {}),
        notificationIds: [...(baseState?.ui?.notificationIds ?? [])],
      },
      users: {
        ...(baseState?.users ?? {}),
        ...Object.fromEntries(
        (snapshot.users ?? []).map((user) => [user.id, { ...user }]),
        ),
      },
      dms: {
        ...(baseState?.dms ?? {}),
        ...Object.fromEntries(
        (snapshot.dms ?? []).map((dm) => [dm.id, cloneDm(dm)]),
        ),
      },
      channels: {
        ...(baseState?.channels ?? {}),
        ...Object.fromEntries(
        (snapshot.channels ?? []).map((channel) => [channel.id, cloneChannel(channel)]),
        ),
      },
      threads: {
        ...(baseState?.threads ?? {}),
        ...Object.fromEntries(
        (snapshot.threads ?? []).map((thread) => [thread.id, cloneThread(thread)]),
        ),
      },
      messages: { ...(baseState?.messages ?? {}) },
      notifications: { ...(baseState?.notifications ?? {}) },
      drafts: { ...(baseState?.drafts ?? {}) },
      typing: { ...(baseState?.typing ?? {}) },
      presence: { ...(baseState?.presence ?? {}), ...(snapshot.presence ?? {}) },
      calls: {
        ...(baseState?.calls ?? {}),
        ...Object.fromEntries(
        (snapshot.calls ?? []).map((call) => [call.id, cloneCall(call)]),
        ),
      },
    };

    const sortedMessages = [...(snapshot.messages ?? [])].sort(
      (left, right) => (left.createdAtFrame ?? 0) - (right.createdAtFrame ?? 0),
    );
    for (const rawMessage of sortedMessages) {
      const message = cloneMessage(rawMessage);
      state.messages[message.id] = message;

      if (message.target.kind === "dm") {
        const dmId = message.target.dmId;
        state.dms[dmId] ??= {
          id: dmId,
          participantIds: [],
          messageIds: [],
          unreadCount: 0,
          mentionCount: 0,
        };
        const dm = state.dms[dmId];
        if (!dm.messageIds.includes(message.id)) {
          dm.messageIds.push(message.id);
        }
        dm.lastMessageId = message.id;
      } else {
        const { channelId, threadId } = message.target;
        state.channels[channelId] ??= {
          id: channelId,
          name: channelId,
          memberIds: [],
          threadIds: [],
          unreadCount: 0,
          mentionCount: 0,
        };
        state.threads[threadId] ??= {
          id: threadId,
          channelId,
          messageIds: [],
          participantIds: [],
          unreadCount: 0,
          mentionCount: 0,
          replyCount: 0,
          typingUserIds: [],
          state: "open",
        };
        const channel = state.channels[channelId];
        const thread = state.threads[threadId];
        thread.channelId = channelId;
        if (!channel.threadIds.includes(threadId)) {
          channel.threadIds.push(threadId);
        }
        if (!thread.messageIds.includes(message.id)) {
          thread.messageIds.push(message.id);
        }
      }
    }

    for (const thread of Object.values(state.threads)) {
      if (thread.channelId) {
        state.channels[thread.channelId] ??= {
          id: thread.channelId,
          name: thread.channelId,
          memberIds: [],
          threadIds: [],
          unreadCount: 0,
          mentionCount: 0,
        };
        const channel = state.channels[thread.channelId];
        if (!channel.threadIds.includes(thread.id)) {
          channel.threadIds.push(thread.id);
        }
      }
    }

    state.notifications = Object.fromEntries(
      (snapshot.notifications ?? []).map((notification) => {
        const cloned = cloneNotification(notification);
        return [cloned.id, cloned];
      }),
    );
    state.ui.notificationIds = Object.values(state.notifications)
      .filter((notification) => notification.dismissedAtFrame == null)
      .sort((left, right) => left.createdAtFrame - right.createdAtFrame)
      .map((notification) => notification.id);

    state.drafts = Object.fromEntries(
      (snapshot.drafts ?? []).map((draft) => {
        const cloned = cloneDraft(draft);
        return [cloned.key, cloned];
      }),
    );

    for (const draft of Object.values(state.drafts)) {
      if (draft.key.startsWith("dm:")) {
        const dmId = draft.key.slice(3);
        state.dms[dmId] ??= {
          id: dmId,
          participantIds: [],
          messageIds: [],
          unreadCount: 0,
          mentionCount: 0,
        };
        state.dms[dmId].draftText = draft.text;
      } else if (draft.key.startsWith("thread:")) {
        const [, channelId, threadId] = draft.key.split(":");
        if (channelId && threadId) {
          state.channels[channelId] ??= {
            id: channelId,
            name: channelId,
            memberIds: [],
            threadIds: [],
            unreadCount: 0,
            mentionCount: 0,
          };
          state.threads[threadId] ??= {
            id: threadId,
            channelId,
            messageIds: [],
            participantIds: [],
            unreadCount: 0,
            mentionCount: 0,
            replyCount: 0,
            typingUserIds: [],
            state: "open",
          };
          state.threads[threadId].draftText = draft.text;
        }
      }
    }

    state.typing = Object.fromEntries(
      (snapshot.typing ?? []).map((typing) => {
        const cloned = cloneTyping(typing);
        return [cloned.key, cloned];
      }),
    );
    for (const typing of Object.values(state.typing)) {
      if (typing.key.startsWith("thread:")) {
        const [, , threadId] = typing.key.split(":");
        if (threadId && state.threads[threadId]) {
          state.threads[threadId].typingUserIds = [...typing.userIds];
        }
      }
    }

    applyInitialView(state, initialView);

    if (
      state.screen === TEAMS_SCREENS.DM_THREAD &&
      state.activeDmId &&
      !state.dms[state.activeDmId]
    ) {
      state.dms[state.activeDmId] = {
        id: state.activeDmId,
        participantIds: [],
        messageIds: [],
        unreadCount: 0,
        mentionCount: 0,
      };
    }

    if (
      state.screen === TEAMS_SCREENS.CHANNEL_THREAD &&
      state.activeChannelId &&
      state.activeThreadId
    ) {
      state.channels[state.activeChannelId] ??= {
        id: state.activeChannelId,
        name: state.activeChannelId,
        memberIds: [],
        threadIds: [],
        unreadCount: 0,
        mentionCount: 0,
      };
      state.threads[state.activeThreadId] ??= {
        id: state.activeThreadId,
        channelId: state.activeChannelId,
        messageIds: [],
        participantIds: [],
        unreadCount: 0,
        mentionCount: 0,
        replyCount: 0,
        typingUserIds: [],
        state: "open",
      };
      if (!state.channels[state.activeChannelId].threadIds.includes(state.activeThreadId)) {
        state.channels[state.activeChannelId].threadIds.push(state.activeThreadId);
      }
    }

    for (const message of Object.values(state.messages)) {
      const key = targetKey(message.target);
      state.typing[key] ??= {
        key,
        userIds: [],
        startedAtFrame: 0,
      };
    }

    return state;
  },
};
