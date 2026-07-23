import {
  createIMessageTrackBuilder,
  type IMessageTrackBuilder,
} from "@tokovo/apps-imessage";
import {
  createInstagramTrackBuilder,
  type InstagramTrackBuilder,
} from "@tokovo/apps-instagram";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";
import {
  createSnapchatTrackBuilder,
  type SnapchatTrackBuilder,
} from "@tokovo/apps-snapchat";
import { createTeamsTrackBuilder, TeamsTrackBuilder } from "@tokovo/apps-teams";
import {
  createWhatsAppTrackBuilder,
  type WhatsAppTrackBuilder,
  type WhatsAppSendInputIntent,
} from "@tokovo/apps-whatsapp";
import {
  createXTrackBuilder,
  type XInputIntent,
  type XTrackBuilder,
} from "@tokovo/apps-x";
import { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";
import {
  episode as baseEpisode,
  parseTimeToFrames,
  type EpisodeBuilder,
  type InputSessionOptions,
  type TrackFn,
} from "@tokovo/dsl";
import type {
  InputCadenceIR,
  InputScriptStepIR,
  TrackEpisodeConfig,
} from "@tokovo/ir";
import {
  estimateNaturalInputFrames,
  splitGraphemes,
} from "@tokovo/device-keyboard";
import {
  createScene,
  type SceneBuilder,
  type SceneOptions,
} from "./creator-language.js";

export {
  actor,
  cast,
  SceneBuilder,
  SceneConversation,
  SceneSocial,
} from "./creator-language.js";
export type {
  ActorIdentity,
  ActorProfile,
  ActorRef,
  BuiltInApp,
  CommentHandle,
  ConversationMessageOptions,
  ConversationOptions,
  MessageHandle,
  PostHandle,
  SceneOptions,
  SocialCommentOptions,
  SocialOptions,
  SocialPostOptions,
  StoryHandle,
  StoryHandleKind,
} from "./creator-language.js";

type TeamsTrackBuilderInstance = InstanceType<typeof TeamsTrackBuilder>;
type TypewriterTrackOptions = NonNullable<
  ConstructorParameters<typeof TypewriterTrackBuilder>[3]
>;

const INPUT_STYLE_VARIANCE_SECONDS: Record<
  NonNullable<InputCadenceIR["style"]>,
  number
> = {
  slow: 0.07,
  natural: 0.045,
  fast: 0.02,
};

function findGraphemeSequence(
  haystack: readonly string[],
  needle: readonly string[],
): number {
  if (needle.length === 0) return -1;
  for (let start = 0; start <= haystack.length - needle.length; start++) {
    if (
      needle.every((grapheme, index) => haystack[start + index] === grapheme)
    ) {
      return start;
    }
  }
  return -1;
}

interface StructuredInputIntent {
  deviceId: string;
  fieldId: string;
  submitFrame: number;
  text: string;
  input: WhatsAppSendInputIntent["input"] | XInputIntent["input"];
}

function addStructuredInputSession(
  ep: EpisodeBuilder,
  fps: number,
  intent: StructuredInputIntent,
  appId: "app_whatsapp" | "app_x",
  errorPrefix: "WHATSAPP" | "X",
  returnKey: "return" | "send",
): void {
  const { input, submitFrame, text } = intent;
  const locale = input.keyboard?.locale ?? input.locale ?? "en-US";
  const typedText = input.correction?.typed ?? text;
  const typedGraphemes = splitGraphemes(typedText, locale);
  if (typedGraphemes.length === 0) {
    throw new Error(
      `${errorPrefix}_INPUT_EMPTY: a structured input send requires text.`,
    );
  }

  const correctionPauseFrames =
    input.correction?.pauseFrames ?? Math.max(1, Math.round(fps * 0.2));
  const cadenceStyle = input.style ?? input.cadence?.style ?? "natural";
  let cadence: InputCadenceIR = {
    ...input.cadence,
    style: cadenceStyle,
  };
  let durationFrames: number;

  if (input.duration !== undefined) {
    durationFrames = parseTimeToFrames(input.duration, fps);
    const focusLeadFrames =
      cadence.focusLeadFrames ?? Math.max(1, Math.round(fps * 0.25));
    const correctionFixedFrames = input.correction
      ? correctionPauseFrames + 1
      : 0;
    const pacedOperations = typedGraphemes.length + (input.correction ? 1 : 0);
    const pacingBudget =
      durationFrames - focusLeadFrames - correctionFixedFrames;
    if (pacingBudget < pacedOperations) {
      throw new Error(
        `${errorPrefix}_INPUT_TIMING_OVERFLOW: ${durationFrames} frames cannot fit ` +
          `${pacedOperations} edit operations before the send at frame ${submitFrame}.`,
      );
    }
    cadence = {
      ...cadence,
      focusLeadFrames,
      framesPerGrapheme: Math.max(
        1,
        Math.floor(pacingBudget / pacedOperations),
      ),
      varianceFrames: 0,
      punctuationPauseFrames: 0,
    };
  } else {
    const varianceFrames =
      cadence.varianceFrames ??
      Math.max(0, Math.round(INPUT_STYLE_VARIANCE_SECONDS[cadenceStyle] * fps));
    durationFrames =
      estimateNaturalInputFrames(typedText, fps, cadence, locale) +
      typedGraphemes.length * varianceFrames +
      (input.correction
        ? correctionPauseFrames +
          1 +
          (cadence.framesPerGrapheme ?? Math.max(1, Math.round(0.115 * fps)))
        : 0);
  }

  const startFrame = submitFrame - durationFrames;
  if (startFrame < 0) {
    throw new Error(
      `${errorPrefix}_INPUT_TIMING_OVERFLOW: input for the send at frame ${submitFrame} ` +
        `would need to start at frame ${startFrame}. Move the send later or shorten the duration.`,
    );
  }

  let script: InputScriptStepIR[] | undefined;
  if (input.correction) {
    const replaceGraphemes = splitGraphemes(input.correction.replace, locale);
    const replacementStart = findGraphemeSequence(
      typedGraphemes,
      replaceGraphemes,
    );
    if (replacementStart < 0) {
      throw new Error(
        `${errorPrefix}_INPUT_CORRECTION_MISMATCH: ${JSON.stringify(input.correction.replace)} ` +
          `is not present in ${JSON.stringify(typedText)}.`,
      );
    }
    const corrected = [...typedGraphemes];
    corrected.splice(
      replacementStart,
      replaceGraphemes.length,
      ...splitGraphemes(input.correction.with, locale),
    );
    if (corrected.join("") !== text) {
      throw new Error(
        `${errorPrefix}_INPUT_CORRECTION_MISMATCH: correction produces ${JSON.stringify(corrected.join(""))} ` +
          `instead of the sent text ${JSON.stringify(text)}.`,
      );
    }
    const range = {
      anchor: replacementStart,
      focus: replacementStart + replaceGraphemes.length,
    };
    script = [
      { type: "type", text: typedText, cadence },
      { type: "pause", frames: correctionPauseFrames },
      { type: "setSelection", selection: range },
      { type: "replaceRange", range, text: input.correction.with },
    ];
  }

  const options: InputSessionOptions = {
    id: input.id,
    appId,
    at: startFrame,
    submitAt: submitFrame,
    until: submitFrame + Math.max(5, Math.round(fps * 0.25)),
    expectedFinalValue: text,
    seed: input.seed,
    source: input.source,
    locale,
    direction: input.direction,
    keyboard: {
      ...input.keyboard,
      returnKey,
    },
    cadence,
    ...(script ? { script } : { text }),
  };
  ep.input(intent.deviceId, intent.fieldId, options);
}

function addWhatsAppInputSession(
  ep: EpisodeBuilder,
  fps: number,
  intent: WhatsAppSendInputIntent,
): void {
  addStructuredInputSession(
    ep,
    fps,
    { ...intent, submitFrame: intent.sendFrame },
    "app_whatsapp",
    "WHATSAPP",
    "send",
  );
}

function addXInputSession(
  ep: EpisodeBuilder,
  fps: number,
  intent: XInputIntent,
): void {
  addStructuredInputSession(
    ep,
    fps,
    intent,
    "app_x",
    "X",
    intent.fieldId.startsWith("thread:") ? "send" : "return",
  );
}

export type CodeFirstEpisodeBuilder = EpisodeBuilder & {
  scene: (
    id: string,
    options: SceneOptions,
    fn: (scene: SceneBuilder) => void,
  ) => CodeFirstEpisodeBuilder;
  whatsapp: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<WhatsAppTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  imessage: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<IMessageTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  snapchat: (
    deviceId: string,
    conversationId: string,
    fn: TrackFn<SnapchatTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  instagram: (
    deviceId: string,
    fn: TrackFn<InstagramTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  linkedin: (
    deviceId: string,
    fn: TrackFn<LinkedInTrackBuilder>,
  ) => CodeFirstEpisodeBuilder;
  teams: (
    deviceId: string,
    fn: TrackFn<TeamsTrackBuilderInstance>,
  ) => CodeFirstEpisodeBuilder;
  x: (deviceId: string, fn: TrackFn<XTrackBuilder>) => CodeFirstEpisodeBuilder;
  typewriter: (
    deviceId: string,
    fn: TrackFn<TypewriterTrackBuilder>,
    options?: TypewriterTrackOptions,
  ) => CodeFirstEpisodeBuilder;
};

export function episode(
  id: string,
  config: TrackEpisodeConfig,
): CodeFirstEpisodeBuilder {
  const ep = baseEpisode(id, config) as CodeFirstEpisodeBuilder;
  const sceneIds = new Set<string>();

  ep.scene = (sceneId, options, fn) => {
    if (sceneIds.has(sceneId)) {
      throw new Error(
        `Scene id "${sceneId}" is already used in episode "${id}"`,
      );
    }
    createScene(ep, sceneId, options, config.fps, fn);
    sceneIds.add(sceneId);
    return ep;
  };

  ep.whatsapp = (deviceId, conversationId, fn) =>
    ep.track(
      "app_whatsapp",
      (getOrder) =>
        createWhatsAppTrackBuilder(
          config.fps,
          deviceId,
          conversationId,
          getOrder,
          (intent) => addWhatsAppInputSession(ep, config.fps, intent),
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.imessage = (deviceId, conversationId, fn) =>
    ep.track(
      "app_imessage",
      (getOrder) =>
        createIMessageTrackBuilder(
          config.fps,
          deviceId,
          conversationId,
          getOrder,
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.snapchat = (deviceId, conversationId, fn) =>
    ep.track(
      "app_snapchat",
      (getOrder) =>
        createSnapchatTrackBuilder(
          config.fps,
          deviceId,
          conversationId,
          getOrder,
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.instagram = (deviceId, fn) =>
    ep.track(
      "app_instagram",
      (getOrder) => createInstagramTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.linkedin = (deviceId, fn) =>
    ep.track(
      "app_linkedin",
      (getOrder) => new LinkedInTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.teams = (deviceId, fn) =>
    ep.track(
      "app_teams",
      (getOrder) => createTeamsTrackBuilder(config.fps, deviceId, getOrder),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.x = (deviceId, fn) =>
    ep.track(
      "app_x",
      (getOrder) =>
        createXTrackBuilder(config.fps, deviceId, getOrder, (intent) =>
          addXInputSession(ep, config.fps, intent),
        ),
      fn,
    ) as CodeFirstEpisodeBuilder;

  ep.typewriter = (deviceId, fn, options) =>
    ep.track(
      "app_typewriter",
      (getOrder) =>
        new TypewriterTrackBuilder(config.fps, deviceId, getOrder, options),
      fn,
    ) as CodeFirstEpisodeBuilder;

  return ep;
}
