// Local-only browser probe using the repository's pinned Remotion browser API.
// Run: mise exec -- node --import tsx scripts/profile-ui.mjs EPISODE START COUNT
import path from "node:path";
import { createRequire } from "node:module";
import { openBrowser } from "@remotion/renderer";
import { getServeUrl } from "../src/remotion.ts";
import { measureBodyText } from "@tokovo/core";
import { getEpisodeRenderData } from "video-runner/render-data";

const [
  episodeId = "notification-native-stress",
  startRaw = "90",
  countRaw = "90",
  historyRaw = "0",
] = process.argv.slice(2);
const start = Number(startRaw),
  count = Number(countRaw);
const historyCount = Number(historyRaw);
if (!Number.isInteger(historyCount) || historyCount < 0 || historyCount > 10000)
  throw new Error("History count must be 0..10000");
if (!Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 1 || count > 600)
  throw new Error("Expected START >= 0 and COUNT 1..600");
const require = createRequire(import.meta.url);
const rendererRoot = path.dirname(require.resolve("@remotion/renderer"));
const { setPropsAndEnv } = require(path.join(rendererRoot, "set-props-and-env.js"));
const { seekToFrame } = require(path.join(rendererRoot, "seek-to-frame.js"));
const { serveUrl: root } = await getServeUrl();
const { prepareServer } = require(path.join(rendererRoot, "prepare-server.js"));
const server = await prepareServer({ webpackConfigOrServeUrl: root, port: null, remotionRoot: path.resolve("../.."), offthreadVideoThreads: 2, logLevel: "error", indent: false, offthreadVideoCacheSizeInBytes: 128*1024*1024, binariesDirectory: null, forceIPv4: true });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
try {
  const page = await browser.newPage({
    context: () => null,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onBrowserLog: null,
    onLog: () => {},
  });
  await page.evaluateOnNewDocument(() => {
    window.profileErrors = [];
    window.addEventListener("error", (event) =>
      window.profileErrors.push(event.error?.stack ?? event.message),
    );
    window.addEventListener("unhandledrejection", (event) =>
      window.profileErrors.push(String(event.reason?.stack ?? event.reason)),
    );
  });
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  let renderData = await getEpisodeRenderData(episodeId);
  if (historyCount && episodeId.startsWith("x-")) {
    const initialWorld = structuredClone(renderData.prepared.initialWorld);
    for (const state of Object.values(initialWorld.appInstances)) {
      if (state.schemaVersion !== 2 || !state.tweetsById) continue;
      const users = Object.keys(state.usersById);
      const template = Object.values(state.tweetsById)[0];
      const thread = Object.values(state.dmThreadsById)[0];
      const message = Object.values(state.dmMessagesById)[0];
      const media = Object.values(state.tweetsById).find(
        (tweet) => tweet.media?.type === "image",
      )?.media;
      for (let i = 0; i < historyCount; i++) {
        const id = `probe-post-${i}`;
        state.tweetsById[id] = {
          ...template,
          id,
          authorId: users[i % users.length],
          text: `History ${i}: readable copy with wrapped lines and a clear message.`,
          replyIds: [],
          quoteTweetId: undefined,
          repostOfId: undefined,
          replyToId: undefined,
          media,
          likedBy: [state.currentUserId],
          createdAt: template.createdAt - i * 1000,
        };
        state.timelineIds.push(id);
        const nid = `probe-notification-${i}`;
        state.notificationsById[nid] = {
          id: nid,
          type: "mention",
          actorId: users[i % users.length],
          tweetId: id,
          createdAt: template.createdAt - i * 1000,
          read: false,
          body: "A reply with enough text to exercise measured notification rows.",
        };
        state.notificationIds.push(nid);
        if (thread && message) {
          const mid = `probe-message-${i}`;
          state.dmMessagesById[mid] = {
            ...message,
            id: mid,
            text: `Message ${i}: a useful conversation, not placeholder bubbles.`,
            senderId: thread.participantIds[i % thread.participantIds.length],
            createdAt: message.createdAt - (historyCount - i) * 1000,
          };
          thread.messageIds.unshift(mid);
          const tid = `probe-thread-${i}`;
          state.dmThreadsById[tid] = { ...thread, id: tid, messageIds: [] };
          state.dmThreadIds.push(tid);
        }
      }
    }
    renderData = { ...renderData, prepared: { ...renderData.prepared, initialWorld } };
  } else if (historyCount) {
    const program = renderData.prepared.notificationProgram;
    if (!program?.records[0])
      throw new Error("History stress requires an episode with notifications");
    const records = Array.from({ length: historyCount }, (_, index) => ({
      ...program.records[0],
      id: `profile-${index}`,
      groupId: `profile-group-${index}`,
      deliverAtFrame: 1,
      sequence: index,
    }));
    renderData = {
      ...renderData,
      prepared: {
        ...renderData.prepared,
        notificationProgram: { ...program, records: [...program.records, ...records] },
      },
    };
  }
  const { NoReactInternals } = createRequire(
    new URL("../../video-runner/package.json", import.meta.url),
  )("remotion/no-react");
  const props = NoReactInternals.serializeJSONWithSpecialTypes({
    data: { episodeId, renderData },
    indent: undefined,
    staticBase: null,
  }).serializedString;
  await setPropsAndEnv({
    page,
    serveUrl: server.serveUrl,
    serializedInputPropsWithCustomSchema: props,
    initialFrame: start,
    timeoutInMilliseconds: 60000,
    proxyPort: server.offthreadPort,
    retriesRemaining: 0,
    audioEnabled: false,
    videoEnabled: true,
    indent: false,
    logLevel: "error",
    onServeUrlVisited: () => {},
    isMainTab: true,
    mediaCacheSizeInBytes: null,
    initialMemoryAvailable: null,
    darkMode: false,
  });
  await page.evaluate(
    (props) =>
      window.remotion_setBundleMode({
        type: "composition",
        compositionName: "episode-render",
        serializedResolvedPropsWithSchema: props,
        compositionDurationInFrames: 3600,
        compositionFps: 30,
        compositionHeight: 1920,
        compositionWidth: 1080,
      }),
    props,
  );
  await seekToFrame({
    page,
    frame: start,
    composition: "episode-render",
    timeoutInMilliseconds: 60000,
    logLevel: "error",
    indent: false,
    attempt: 1,
  });
  const screen = await page.evaluate(() => ({
    text: document.body.innerText + JSON.stringify(window.profileErrors),
    nodes: document.querySelectorAll("*").length,
  }));
  if (screen.nodes < 50 || /Render Error|Something went wrong/.test(screen.text))
    throw new Error(`Profiling surface failed: ${screen.text}`);
  const samples = [
    "Dinner at the usual place?",
    "Yes. Booking for 7.",
    "office affinity",
    "AVATAR",
    "18:30",
    "مرحبا بالعالم",
    "नमस्ते दुनिया",
  ];
  const result = await page.evaluate(
    async (start, count, samples) => {
      await document.fonts.ready;
      await Promise.all([
        document.fonts.load('400 17px "Inter Variable"'),
        document.fonts.load('400 17px "Noto Sans Arabic Variable"', "مرحبا"),
        document.fonts.load('400 17px "Noto Sans Devanagari Variable"', "नमस्ते"),
      ]);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font =
        '400 17px "Inter Variable", "Noto Sans Arabic Variable", "Noto Sans Devanagari Variable", "Noto Sans JP Variable", sans-serif';
      const widths = samples.map((text) => ({
        text,
        browserWidth: context.measureText(text).width,
      }));
      const nextPaint = () => new Promise((resolve) => requestAnimationFrame(resolve));
      const times = [];
      let maxRows = 0,
        maxNodes = 0;
      const heapBefore = performance.memory?.usedJSHeapSize;
      for (let index = 1; index <= count; index++) {
        const before = performance.now();
        window.remotion_setFrame(start + index, "episode-render", 1);
        await nextPaint();
        while (!window.remotion_renderReady) {
          if (window.remotion_cancelledError) throw new Error(window.remotion_cancelledError);
          if (performance.now() - before > 60000) throw new Error("Profiling frame timed out");
          await nextPaint();
        }
        times.push(performance.now() - before);
        maxRows = Math.max(maxRows, document.querySelectorAll("[data-history-visible-row]").length);
        maxNodes = Math.max(maxNodes, document.querySelectorAll("*").length);
      }
      const textOverflow = [...document.querySelectorAll("[data-x-platform] div")]
        .filter(
          (node) => node.style.whiteSpace === "pre" && node.scrollWidth > node.clientWidth + 1,
        )
        .map((node) => ({
          text: node.textContent?.slice(0, 100),
          overflow: node.scrollWidth - node.clientWidth,
        }));
      const sorted = [...times].sort((a, b) => a - b);
      return {
        textOverflow,
        frames: count,
        medianMs: sorted[Math.floor(count * 0.5)],
        p95Ms: sorted[Math.floor(count * 0.95)],
        maxMs: sorted.at(-1),
        over33ms: times.filter((value) => value > 33.34).length,
        slowFrames: times.flatMap((ms,index) => ms>33.34 ? [{ frame:start+index+1, ms }] : []),
        maxRows,
        maxNodes,
        heapBefore,
        heapAfter: performance.memory?.usedJSHeapSize,
        widths,
      };
    },
    start,
    count,
    samples,
  );
  if (episodeId.startsWith("x-") && result.textOverflow.length)
    throw new Error(`X text overflow: ${JSON.stringify(result.textOverflow)}`);
  if (episodeId.startsWith("x-") && historyCount && result.maxNodes > 1500)
    throw new Error(`X render window is unbounded: ${result.maxNodes} DOM nodes`);
  result.widths = result.widths.map((item) => ({
    ...item,
    shapedWidth: measureBodyText(item.text, 17),
    error: measureBodyText(item.text, 17) - item.browserWidth,
  }));
  if (result.widths.some((item) => Math.abs(item.error) > 0.01))
    throw new Error(`Font shaping differs from Chromium: ${JSON.stringify(result.widths)}`);
  console.log(
    JSON.stringify(
      {
        episodeId,
        start,
        historyCount,
        environment:
          "headless Chromium, 1080x1920, ANGLE; sequential frame-to-ready timing, not live Player FPS",
        ...result,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close({ silent: true });
  await server.closeServer(true);
}
