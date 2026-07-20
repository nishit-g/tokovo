import type {
  StatusViewerAdvancedEvent,
  StatusViewerClosedEvent,
  StatusViewerOpenedEvent,
} from "../schemas/index.js";
import type {
  WhatsAppState,
  WhatsAppStatusUpdate,
} from "../types/index.js";
import type {
  HandlerContext,
  MutableHandlerRegistry,
} from "./registry.js";

function getState(ctx: HandlerContext): WhatsAppState {
  const state = ctx.draft.appState?.app_whatsapp as WhatsAppState | undefined;
  if (!state) throw new Error("WhatsApp status viewer requires app state");
  return state;
}

function statusQueue(statuses: readonly WhatsAppStatusUpdate[]): WhatsAppStatusUpdate[] {
  const byAuthor = new Map<string, WhatsAppStatusUpdate[]>();
  for (const status of statuses) {
    const authored = byAuthor.get(status.authorId) ?? [];
    authored.push(status);
    byAuthor.set(status.authorId, authored);
  }

  return [...byAuthor.values()]
    .sort(
      (left, right) =>
        Math.max(...right.map((status) => status.postedAt)) -
        Math.max(...left.map((status) => status.postedAt)),
    )
    .flatMap((authored) =>
      authored.sort((left, right) => left.postedAt - right.postedAt),
    );
}

function activateStatusViewer(
  state: WhatsAppState,
  status: WhatsAppStatusUpdate,
  frame: number,
): void {
  status.viewed = true;
  state.statusViewer = {
    statusId: status.id,
    authorId: status.authorId,
    openedAt: frame,
  };
}

export function registerStatusHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<StatusViewerOpenedEvent>(
    "STATUS_VIEWER_OPENED",
    (ctx, event) => {
      const state = getState(ctx);
      if (state.statusViewer) {
        throw new Error("Cannot open WhatsApp status viewer while it is already open");
      }
      const status = state.statuses.find(
        (candidate) => candidate.id === event.payload.statusId,
      );
      if (!status) {
        throw new Error(
          `Cannot open missing WhatsApp status "${event.payload.statusId}"`,
        );
      }
      activateStatusViewer(state, status, event.at);
    },
  );

  registry.registerHandler<StatusViewerAdvancedEvent>(
    "STATUS_VIEWER_ADVANCED",
    (ctx, event) => {
      const state = getState(ctx);
      if (!state.statusViewer) {
        throw new Error("Cannot advance WhatsApp status viewer when it is not open");
      }
      const queue = statusQueue(state.statuses);
      const currentIndex = queue.findIndex(
        (status) => status.id === state.statusViewer?.statusId,
      );
      if (currentIndex < 0) {
        throw new Error(
          `WhatsApp status viewer references missing status "${state.statusViewer.statusId}"`,
        );
      }
      const offset = event.payload.direction === "next" ? 1 : -1;
      const next = queue[currentIndex + offset];
      if (!next) {
        state.statusViewer = null;
        return;
      }
      activateStatusViewer(state, next, event.at);
    },
  );

  registry.registerHandler<StatusViewerClosedEvent>(
    "STATUS_VIEWER_CLOSED",
    (ctx) => {
      const state = getState(ctx);
      if (!state.statusViewer) {
        throw new Error("Cannot close WhatsApp status viewer when it is not open");
      }
      state.statusViewer = null;
    },
  );
}
