import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";

import { LayoutCache, computeConversationLayout } from "../layout/cache.js";
import { projectWhatsAppThread } from "../thread/projector.js";
import {
  createWhatsAppThreadWindow,
  DEFAULT_THREAD_RENDER_LIMIT,
} from "../thread/window.js";
import type { WhatsAppConversation, WhatsAppMessage } from "../types/index.js";

const MESSAGE_COUNT = 10_000;
const COLD_PROJECTION_BUDGET_MS = 1_500;
const COLD_LAYOUT_BUDGET_MS = 1_500;
const HOT_PROJECTION_ITERATIONS = 1_000;
const HOT_LAYOUT_ITERATIONS = 500;
const HOT_PROJECTION_CPU_BUDGET_MS = 150;
const HOT_LAYOUT_CPU_BUDGET_MS = 150;

function elapsedCpuMs(start: NodeJS.CpuUsage): number {
  const elapsed = process.cpuUsage(start);
  return (elapsed.user + elapsed.system) / 1_000;
}

function createLongConversation(): WhatsAppConversation {
  const messages: WhatsAppMessage[] = Array.from(
    { length: MESSAGE_COUNT },
    (_, index) => ({
      id: `message-${index}`,
      type: "text",
      text: `Deterministic long-thread message ${index}`,
      from: index % 2 === 0 ? "me" : `member-${index % 11}`,
      at: index * 3,
      status: index % 2 === 0 ? "read" : undefined,
      reactions:
        index % 19 === 0
          ? [{ emoji: "👍", count: (index % 4) + 1, fromMe: index % 2 === 0 }]
          : undefined,
      replyTo:
        index > 0 && index % 23 === 0
          ? { messageId: `message-${index - 1}` }
          : undefined,
    }),
  );

  return {
    id: "long-thread",
    type: "group",
    name: "Long thread benchmark",
    messages,
  };
}

describe("WhatsApp long-thread performance contract", () => {
  it("projects and lays out 10,000 messages within release budgets", () => {
    const conversation = createLongConversation();
    const projectionInput = {
      conversationId: conversation.id,
      conversation,
      messages: conversation.messages,
      ownerName: "Owner",
      baseTime: new Date("2026-07-20T12:00:00.000Z"),
      fps: 30,
      locale: "en-US" as const,
    };

    const projectionStartedAt = performance.now();
    const projection = projectWhatsAppThread(projectionInput);
    const coldProjectionMs = performance.now() - projectionStartedAt;

    expect(projection.messageCount).toBe(MESSAGE_COUNT + 1);
    expect(projection.messagesById.size).toBe(MESSAGE_COUNT + 1);
    expect(coldProjectionMs).toBeLessThan(COLD_PROJECTION_BUDGET_MS);

    const latestWindow = createWhatsAppThreadWindow(projection);
    expect(latestWindow.renderedMessageCount).toBe(DEFAULT_THREAD_RENDER_LIMIT);
    expect(latestWindow.hiddenBefore).toBe(
      projection.messageCount - DEFAULT_THREAD_RENDER_LIMIT,
    );
    expect(latestWindow.hiddenAfter).toBe(0);

    const focusedWindow = createWhatsAppThreadWindow(projection, {
      focusMessageId: "message-5000",
    });
    expect(focusedWindow.renderedMessageCount).toBe(
      DEFAULT_THREAD_RENDER_LIMIT,
    );
    expect(focusedWindow.hiddenBefore).toBeGreaterThan(0);
    expect(focusedWindow.hiddenAfter).toBeGreaterThan(0);
    expect(
      focusedWindow.blocks.some(
        (block) =>
          block.kind === "run" &&
          block.items.some((item) => item.message.id === "message-5000"),
      ),
    ).toBe(true);

    const layoutCache = new LayoutCache({
      maxEntries: 2,
      scopeKey: "long-thread-benchmark",
    });
    const layoutOptions = {
      viewportWidth: 393,
      viewportHeight: 852,
      cache: layoutCache,
    };
    const layoutStartedAt = performance.now();
    const layout = computeConversationLayout(conversation, layoutOptions);
    const coldLayoutMs = performance.now() - layoutStartedAt;

    expect(layout.messageCount).toBe(MESSAGE_COUNT);
    expect(layout.messageLayouts.size).toBe(MESSAGE_COUNT);
    expect(coldLayoutMs).toBeLessThan(COLD_LAYOUT_BUDGET_MS);

    let projectionCacheStable = true;
    // CPU time enforces algorithmic cost without turning concurrent package
    // scheduling pressure into a false performance regression.
    const hotProjectionStartedAt = process.cpuUsage();
    for (let index = 0; index < HOT_PROJECTION_ITERATIONS; index += 1) {
      if (projectWhatsAppThread(projectionInput) !== projection) {
        projectionCacheStable = false;
        break;
      }
    }
    const hotProjectionCpuMs = elapsedCpuMs(hotProjectionStartedAt);
    expect(projectionCacheStable).toBe(true);
    expect(hotProjectionCpuMs).toBeLessThan(HOT_PROJECTION_CPU_BUDGET_MS);

    let layoutCacheStable = true;
    const hotLayoutStartedAt = process.cpuUsage();
    for (let index = 0; index < HOT_LAYOUT_ITERATIONS; index += 1) {
      if (computeConversationLayout(conversation, layoutOptions) !== layout) {
        layoutCacheStable = false;
        break;
      }
    }
    const hotLayoutCpuMs = elapsedCpuMs(hotLayoutStartedAt);
    expect(layoutCacheStable).toBe(true);
    expect(hotLayoutCpuMs).toBeLessThan(HOT_LAYOUT_CPU_BUDGET_MS);
  });
});
