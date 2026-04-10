import type { DslExtension } from "@tokovo/core";

interface SnapchatBeatBuilder {
  ops: Array<Record<string, unknown>>;
}

export interface SnapchatDslApi {
  openChatList(): void;
  openConversation(conversationId: string): void;
  send(conversationId: string, text: string): void;
  receive(conversationId: string, from: string, text: string): void;
  sendSnap(conversationId: string, snapType: "photo" | "video", url?: string): void;
  receiveSnap(conversationId: string, from: string, snapType: "photo" | "video", url?: string): void;
  typing: {
    start(conversationId: string, actor: string): void;
    end(conversationId: string, actor: string): void;
  };
}

function appEvent(type: string, payload: Record<string, unknown>): Record<string, unknown> {
  return {
    kind: "AppEvent",
    appId: "app_snapchat",
    type,
    payload,
  };
}

export const snapchatDsl: DslExtension<SnapchatDslApi> = {
  createApi: (builderUnknown: unknown): SnapchatDslApi => {
    const builder = builderUnknown as SnapchatBeatBuilder;
    return {
      openChatList: () => {
        builder.ops.push(appEvent("SNAPCHAT_SET_SCREEN", { screen: "chat_list" }));
      },
      openConversation: (conversationId) => {
        builder.ops.push(appEvent("SNAPCHAT_CONVERSATION_OPEN", { conversationId }));
      },
      send: (conversationId, text) => {
        builder.ops.push(appEvent("SNAPCHAT_MESSAGE_SEND", { conversationId, text }));
      },
      receive: (conversationId, from, text) => {
        builder.ops.push(appEvent("SNAPCHAT_MESSAGE_RECEIVE", { conversationId, from, text }));
      },
      sendSnap: (conversationId, snapType, url) => {
        builder.ops.push(appEvent("SNAPCHAT_SNAP_SEND", { conversationId, snapType, url }));
      },
      receiveSnap: (conversationId, from, snapType, url) => {
        builder.ops.push(appEvent("SNAPCHAT_SNAP_RECEIVE", { conversationId, from, snapType, url }));
      },
      typing: {
        start: (conversationId, actor) => {
          builder.ops.push(appEvent("SNAPCHAT_TYPING_START", { conversationId, actor }));
        },
        end: (conversationId, actor) => {
          builder.ops.push(appEvent("SNAPCHAT_TYPING_END", { conversationId, actor }));
        },
      },
    };
  },
};
