import type {
  GestureCancelledEvent,
  GestureCompletedEvent,
  GestureStartedEvent,
  GestureUpdatedEvent,
  ReplyComposerDismissedEvent,
  SetLocaleEvent,
} from "../schemas/index.js";
import type { WhatsAppState } from "../types/index.js";
import type {
  HandlerContext,
  MutableHandlerRegistry,
} from "./registry.js";

function getState(ctx: HandlerContext): WhatsAppState {
  return ctx.state;
}

function requireMatchingGesture(
  ctx: HandlerContext,
  conversationId: string,
  messageId: string,
) {
  const gesture = getState(ctx).activeGesture;
  if (
    !gesture ||
    gesture.conversationId !== conversationId ||
    gesture.messageId !== messageId
  ) {
    throw new Error(
      `WhatsApp gesture for message "${messageId}" is not active in conversation "${conversationId}"`,
    );
  }
  return gesture;
}

export function registerInteractionHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<GestureStartedEvent>(
    "GESTURE_STARTED",
    (ctx, event) => {
      ctx.requireMessageById(event.payload.messageId, "start message gesture");
      const state = getState(ctx);
      if (state.activeGesture) {
        throw new Error(
          `Cannot start WhatsApp gesture while "${state.activeGesture.gesture}" is active`,
        );
      }
      state.activeGesture = {
        conversationId: event.payload.conversationId,
        messageId: event.payload.messageId,
        gesture: event.payload.gesture,
        phase: "active",
        progress: 0,
      };
    },
  );

  registry.registerHandler<GestureUpdatedEvent>(
    "GESTURE_UPDATED",
    (ctx, event) => {
      const gesture = requireMatchingGesture(
        ctx,
        event.payload.conversationId,
        event.payload.messageId,
      );
      if (gesture.phase !== "active") {
        throw new Error("Cannot update a completed WhatsApp gesture");
      }
      gesture.progress = event.payload.progress;
    },
  );

  registry.registerHandler<GestureCompletedEvent>(
    "GESTURE_COMPLETED",
    (ctx, event) => {
      const state = getState(ctx);
      const gesture = requireMatchingGesture(
        ctx,
        event.payload.conversationId,
        event.payload.messageId,
      );
      if (gesture.gesture === "swipe_reply") {
        state.replyComposer = {
          conversationId: gesture.conversationId,
          messageId: gesture.messageId,
        };
        state.activeGesture = null;
        return;
      }
      gesture.phase = "completed";
      gesture.progress = 1;
    },
  );

  registry.registerHandler<GestureCancelledEvent>(
    "GESTURE_CANCELLED",
    (ctx, event) => {
      requireMatchingGesture(
        ctx,
        event.payload.conversationId,
        event.payload.messageId,
      );
      getState(ctx).activeGesture = null;
    },
  );

  registry.registerHandler<ReplyComposerDismissedEvent>(
    "REPLY_COMPOSER_DISMISSED",
    (ctx, event) => {
      const state = getState(ctx);
      if (state.replyComposer?.conversationId !== event.payload.conversationId) {
        throw new Error(
          `WhatsApp reply composer is not active in conversation "${event.payload.conversationId}"`,
        );
      }
      state.replyComposer = null;
    },
  );

  registry.registerHandler<SetLocaleEvent>("SET_LOCALE", (ctx, event) => {
    getState(ctx).locale = event.payload.locale;
  });
}
