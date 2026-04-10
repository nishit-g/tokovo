import type { DslExtension } from "@tokovo/core";

interface IMessageBeatBuilder {
  ops: Array<Record<string, unknown>>;
}

export interface IMessageDslApi {
  openConversation(conversationId: string): void;
  openList(): void;
  send(conversationId: string, text: string): void;
  receive(conversationId: string, from: string, text: string): void;
  typing: {
    start(conversationId: string, actor: string): void;
    end(conversationId: string, actor: string): void;
  };
  draft(conversationId: string, text: string): void;
}

function appEvent(type: string, payload: Record<string, unknown>): Record<string, unknown> {
  return {
    kind: "AppEvent",
    appId: "app_imessage",
    type,
    payload,
  };
}

export const iMessageDsl: DslExtension<IMessageDslApi> = {
  createApi: (builderUnknown: unknown): IMessageDslApi => {
    const builder = builderUnknown as IMessageBeatBuilder;
    return {
      openConversation: (conversationId) => {
        builder.ops.push(appEvent("IMESSAGE_CONVERSATION_OPEN", { conversationId }));
      },
      openList: () => {
        builder.ops.push(appEvent("IMESSAGE_SET_SCREEN", { screen: "list" }));
      },
      send: (conversationId, text) => {
        builder.ops.push(appEvent("IMESSAGE_MESSAGE_SEND", { conversationId, text }));
      },
      receive: (conversationId, from, text) => {
        builder.ops.push(appEvent("IMESSAGE_MESSAGE_RECEIVE", { conversationId, from, text }));
      },
      typing: {
        start: (conversationId, actor) => {
          builder.ops.push(appEvent("IMESSAGE_TYPING_START", { conversationId, actor }));
        },
        end: (conversationId, actor) => {
          builder.ops.push(appEvent("IMESSAGE_TYPING_END", { conversationId, actor }));
        },
      },
      draft: (conversationId, text) => {
        builder.ops.push(appEvent("IMESSAGE_SET_DRAFT", { conversationId, text }));
      },
    };
  },
};
