import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterTrackEvent } from "../types/index.js";
import { mulberry32, hashStringToU32, clamp01 } from "../utils/prng.js";
import { deriveKeyPressFromChar } from "../keyboard/index.js";

export interface TypewriterLoweringHandler {
  lower: (event: TrackEvent, ctx: { fps: number }) => RuntimeEvent[];
}

function isTypewriterTrackEvent(event: TrackEvent): event is TypewriterTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === TYPEWRITER_APP_ID
  );
}

function createRuntimeEvent(
  at: number,
  deviceId: string | undefined,
  type: string,
  payload: unknown,
): RuntimeEvent {
  return {
    at,
    kind: "APP",
    appId: TYPEWRITER_APP_ID,
    type,
    payload,
    deviceId,
  } as unknown as RuntimeEvent;
}

function createAudioEvent(
  at: number,
  deviceId: string | undefined,
  input: { soundId: string; volume: number; bus: "ui" | "sfx"; loop?: boolean; duration?: number },
): RuntimeEvent {
  return {
    at,
    kind: "AUDIO",
    type: "PLAY_SOUND",
    soundId: input.soundId,
    volume: input.volume,
    bus: input.bus,
    loop: input.loop,
    duration: input.duration,
    deviceId,
  } as unknown as RuntimeEvent;
}

function durFrames(sec: number | undefined, fps: number, minFrames: number = 1): number | undefined {
  if (typeof sec !== "number" || !isFinite(sec) || sec <= 0) return undefined;
  return Math.max(minFrames, Math.ceil(sec * fps));
}

function isWhitespaceToken(tok: string): boolean {
  return tok.trim().length === 0;
}

function wrapTextWord(input: { text: string; maxCols: number }): string {
  const { text, maxCols } = input;
  const paras = text.split("\n");
  const outParas: string[] = [];

  for (const para of paras) {
    if (para.length <= maxCols) {
      outParas.push(para);
      continue;
    }

    const tokens = para.split(/(\s+)/);
    let line = "";
    const lines: string[] = [];

    for (const tok of tokens) {
      if (!tok) continue;
      if (isWhitespaceToken(tok)) {
        if (line.length === 0) continue;
        if (line.length + tok.length > maxCols) continue;
        line += tok;
        continue;
      }

      if (tok.length > maxCols) {
        // Hard split long tokens (URLs etc)
        let i = 0;
        while (i < tok.length) {
          const slice = tok.slice(i, i + maxCols);
          if (line.length > 0) {
            lines.push(line);
            line = "";
          }
          lines.push(slice);
          i += maxCols;
        }
        continue;
      }

      if (line.length + tok.length > maxCols) {
        if (line.length > 0) lines.push(line);
        line = tok;
      } else {
        line += tok;
      }
    }
    if (line.length > 0) lines.push(line);
    outParas.push(lines.join("\n"));
  }

  return outParas.join("\n");
}

function wrapTextChar(input: { text: string; maxCols: number }): string {
  const { text, maxCols } = input;
  const paras = text.split("\n");
  return paras
    .map((p) => {
      if (p.length <= maxCols) return p;
      const chunks: string[] = [];
      for (let i = 0; i < p.length; i += maxCols) {
        chunks.push(p.slice(i, i + maxCols));
      }
      return chunks.join("\n");
    })
    .join("\n");
}

function categorizeSoundForChar(ch: string): "key" | "space" | "punct" | "return" | "backspace" {
  return deriveKeyPressFromChar(ch).category;
}

function soundIdForCategory(cat: ReturnType<typeof categorizeSoundForChar>): string {
  switch (cat) {
    case "space":
      return "app_typewriter.space";
    case "punct":
      return "app_typewriter.punct";
    case "return":
      return "app_typewriter.carriage";
    case "backspace":
      return "app_typewriter.backspace";
    case "key":
    default:
      return "app_typewriter.key";
  }
}

function baseVolumeForCategory(cat: ReturnType<typeof categorizeSoundForChar>): number {
  switch (cat) {
    case "space":
      return 0.7;
    case "punct":
      return 0.82;
    case "return":
      return 0.95;
    case "backspace":
      return 0.8;
    case "key":
    default:
      return 0.85;
  }
}

function seededVolume(input: { seed: number; tag: string; base: number; var: number }): number {
  const s = (input.seed ^ hashStringToU32(input.tag)) >>> 0;
  const r = mulberry32(s)();
  const v = input.base * (1 + (r - 0.5) * 2 * input.var);
  return clamp01(v);
}

function expandTypeText(input: {
  event: TypewriterTrackEvent;
  fps: number;
}): RuntimeEvent[] {
  const { event, fps } = input;
  const deviceId = (event as { deviceId?: string }).deviceId;
  const payload = (event.payload ?? {}) as {
    text?: string;
    cps?: number;
    fit?: string;
    seed?: number;
    wrap?: "word" | "char" | "none";
    maxCols?: number;
    jitter?: { minFrames?: number; maxFrames?: number };
    mistakes?: { rate?: number; max?: number; alphabet?: string };
    allowOverflow?: boolean;
    pauses?: { afterPunctFrames?: number; afterNewlineFrames?: number; afterSpaceFrames?: number };
	    audio?: Partial<{
	      baseKeyVol: number;
	      baseSpaceVol: number;
	      basePunctVol: number;
	      baseBackspaceVol: number;
	      baseCarriageVol: number;
	      baseBellVol: number;
	      roomVol: number;
	      volVar: number;
	      roomDurationFrames: number;
	      bellColsFromRight: number;
	      // Typing bed: subtle continuous layer only while this typing segment runs.
	      typingBed?: boolean;
	      typingBedVol?: number;
	      typingBedTailS?: number;
	      durKeyS: number;
	      durSpaceS: number;
	      durPunctS: number;
	      durBackspaceS: number;
	      durCarriageS: number;
      durBellS: number;
      durRoomS: number;
    }>;
  };
  const rawText = typeof payload.text === "string" ? payload.text : "";
  const maxCols = typeof payload.maxCols === "number" && payload.maxCols > 0 ? Math.floor(payload.maxCols) : 44;
  const wrap = payload.wrap ?? "word";
  const text = (() => {
    const t = rawText.replace(/\r\n/g, "\n");
    if (wrap === "none") return t;
    if (wrap === "char") return wrapTextChar({ text: t, maxCols });
    return wrapTextWord({ text: t, maxCols });
  })();

  const durationFrames = typeof event.duration === "number" ? Math.max(0, event.duration) : undefined;
  const glyphCount = Math.max(1, text.length);

  const stepFrames = (() => {
    if (durationFrames !== undefined) {
      return Math.max(1, Math.floor(durationFrames / glyphCount));
    }
    const cps = typeof payload.cps === "number" && payload.cps > 0 ? payload.cps : 12;
    return Math.max(1, Math.round(fps / cps));
  })();

  const allowOverflow = payload.allowOverflow === true || durationFrames === undefined;
  const seed = typeof payload.seed === "number" ? payload.seed : hashStringToU32(`${event.at}:${text}`);
  const rng = mulberry32(seed);
  const jitterMin = Math.floor(payload.jitter?.minFrames ?? 0);
  const jitterMax = Math.floor(payload.jitter?.maxFrames ?? 0);
  const jitterRange = Math.max(jitterMin, jitterMax) - Math.min(jitterMin, jitterMax);

  const mistakesRate = payload.mistakes?.rate ?? 0;
  const mistakesMax = Math.max(0, Math.floor(payload.mistakes?.max ?? 0));
  const mistakesAlphabet = payload.mistakes?.alphabet ?? "abcdefghijklmnopqrstuvwxyz";
  let mistakesUsed = 0;

  const out: RuntimeEvent[] = [];
	  let t = event.at;
	  let col = 0;

	  const volVar = payload.audio?.volVar ?? 0.12;
	  const bellColsFromRight = payload.audio?.bellColsFromRight ?? 5;

	  // Optional continuous bed during typing (keeps fast typing from feeling like isolated bursts).
	  // Uses the existing offline-generated room tone asset at a very low volume.
	  const typingBedEnabled = payload.audio?.typingBed !== false;
	  const typingBedVol =
	    payload.audio?.typingBedVol ??
	    Math.min(0.07, (payload.audio?.roomVol ?? 0.16) * 0.35);
	  const typingBedTail = durFrames(payload.audio?.typingBedTailS ?? 0.35, fps, 0) ?? 0;
	  const typingBedStart = t;
	  const durKey = durFrames(payload.audio?.durKeyS ?? 0.05, fps);
	  const durSpace = durFrames(payload.audio?.durSpaceS ?? 0.1, fps);
	  const durPunct = durFrames(payload.audio?.durPunctS ?? 0.05, fps);
	  const durBackspace = durFrames(payload.audio?.durBackspaceS ?? 0.06, fps);
	  const durCarriage = durFrames(payload.audio?.durCarriageS ?? 0.3, fps);
	  const durBell = durFrames(payload.audio?.durBellS ?? 1.5, fps);

  for (const ch of text) {
    if (ch === "\n") {
      out.push(createRuntimeEvent(t, deviceId, "TYPEWRITER_NEWLINE", {}));
      out.push(
        createAudioEvent(t, deviceId, {
          soundId: "app_typewriter.carriage",
          volume: seededVolume({
            seed,
            tag: `ret:${t}`,
            base: payload.audio?.baseCarriageVol ?? baseVolumeForCategory("return"),
            var: Math.min(0.12, volVar),
          }),
	          bus: "sfx",
	          duration: durCarriage,
	        }),
	      );
      col = 0;
    } else {
      // Optional mistake: type a wrong char, backspace, then correct.
      const shouldMistake =
        allowOverflow &&
        mistakesUsed < mistakesMax &&
        mistakesRate > 0 &&
        ch.trim().length > 0 &&
        rng() < mistakesRate;
      if (shouldMistake) {
        const wrongIdx = Math.floor(rng() * mistakesAlphabet.length);
        const wrong = mistakesAlphabet[wrongIdx] ?? "x";
        out.push(createRuntimeEvent(t, deviceId, "TYPEWRITER_KEY", { ch: wrong, noAutoWrap: true }));
        out.push(
          createAudioEvent(t, deviceId, {
            soundId: soundIdForCategory(categorizeSoundForChar(wrong)),
            volume: seededVolume({
              seed,
              tag: `mist:${wrong}:${t}`,
              base:
                categorizeSoundForChar(wrong) === "punct"
                  ? payload.audio?.basePunctVol ?? baseVolumeForCategory("punct")
                  : payload.audio?.baseKeyVol ?? baseVolumeForCategory("key"),
              var: volVar,
            }),
	            bus: "sfx",
	            duration: categorizeSoundForChar(wrong) === "punct" ? durPunct : durKey,
	          }),
	        );
        t += stepFrames;
        out.push(createRuntimeEvent(t, deviceId, "TYPEWRITER_BACKSPACE", {}));
        out.push(
          createAudioEvent(t, deviceId, {
            soundId: "app_typewriter.backspace",
            volume: seededVolume({
              seed,
              tag: `bksp:${t}`,
              base: payload.audio?.baseBackspaceVol ?? baseVolumeForCategory("backspace"),
              var: Math.min(0.12, volVar),
            }),
	            bus: "sfx",
	            duration: durBackspace,
	          }),
	        );
        t += Math.max(1, Math.floor(stepFrames / 2));
        mistakesUsed++;
      }

      out.push(createRuntimeEvent(t, deviceId, "TYPEWRITER_KEY", { ch, noAutoWrap: true }));
      const cat = categorizeSoundForChar(ch);
      out.push(
        createAudioEvent(t, deviceId, {
          soundId: soundIdForCategory(cat),
          volume: seededVolume({
            seed,
            tag: `${cat}:${ch}:${t}`,
            base:
              cat === "space"
                ? payload.audio?.baseSpaceVol ?? baseVolumeForCategory("space")
                : cat === "punct"
                  ? payload.audio?.basePunctVol ?? baseVolumeForCategory("punct")
                  : payload.audio?.baseKeyVol ?? baseVolumeForCategory("key"),
            var: volVar,
          }),
	          bus: "sfx",
	          duration:
	            cat === "space" ? durSpace : cat === "punct" ? durPunct : durKey,
	        }),
	      );

      col += 1;
      const bellAt = maxCols - bellColsFromRight;
      if (allowOverflow && bellAt > 0 && col === bellAt) {
        out.push(
          createAudioEvent(t, deviceId, {
            soundId: "app_typewriter.bell",
            volume: seededVolume({
              seed,
              tag: `bell:${t}`,
              base: payload.audio?.baseBellVol ?? 0.55,
              var: Math.min(0.08, volVar),
            }),
	            bus: "sfx",
	            duration: durBell,
	          }),
	        );
	      }
    }

    const pauseExtra =
      ch === "\n"
        ? Math.max(0, Math.floor(payload.pauses?.afterNewlineFrames ?? 0))
        : ch === " "
          ? Math.max(0, Math.floor(payload.pauses?.afterSpaceFrames ?? 0))
          : categorizeSoundForChar(ch) === "punct"
            ? Math.max(0, Math.floor(payload.pauses?.afterPunctFrames ?? 0))
            : 0;

    const jitter =
      jitterRange > 0
        ? Math.floor((Math.min(jitterMin, jitterMax) + rng() * (jitterRange + 1)) as number)
        : Math.min(jitterMin, jitterMax);
    t += Math.max(1, stepFrames + jitter + pauseExtra);
	  }

	  // Insert typing bed as the first event in the segment, so it deterministically starts
	  // before any key clicks. It is bounded (no infinite loop sounds).
	  if (typingBedEnabled && text.length > 0) {
	    const dur = Math.max(1, (t - typingBedStart) + typingBedTail);
	    out.unshift(
	      createAudioEvent(typingBedStart, deviceId, {
	        soundId: "app_typewriter.room",
	        volume: clamp01(typingBedVol),
	        bus: "sfx",
	        loop: true,
	        duration: dur,
	      }),
	    );
	  }

	  return out;
	}

export const typewriterLowering: TypewriterLoweringHandler = {
  lower: (event: TrackEvent, ctx: { fps: number }): RuntimeEvent[] => {
    if (!isTypewriterTrackEvent(event)) return [];
    const deviceId = (event as { deviceId?: string }).deviceId;

    switch (event.type) {
      case "TYPEWRITER_TYPE_TEXT":
        return expandTypeText({ event, fps: ctx.fps });
      case "TYPEWRITER_INIT_LETTER": {
        const payload = (event.payload ?? {}) as {
          roomTone?: boolean;
          seed?: number;
          audio?: {
            roomVol?: number;
            roomDurationFrames?: number;
            volVar?: number;
            durRoomS?: number;
          };
        };
        // Room tone must be opt-in. If the asset ever goes missing in a harness,
        // default-on room tone creates confusing "silent audio" failures.
        const roomTone = payload.roomTone === true;
        const seed = typeof payload.seed === "number" ? payload.seed : hashStringToU32(`${event.at}:${event._declarationOrder ?? 0}`);
        const roomVol = payload.audio?.roomVol ?? 0.16;
        const roomDurationFrames = payload.audio?.roomDurationFrames ?? 3600;
        const roomVar = Math.min(0.08, payload.audio?.volVar ?? 0.12);
        const roomDur = durFrames(payload.audio?.durRoomS ?? 10.0, ctx.fps);
        const out: RuntimeEvent[] = [createRuntimeEvent(event.at, deviceId, event.type, event.payload ?? {})];
        if (roomTone) {
          out.push(
            createAudioEvent(event.at, deviceId, {
              soundId: "app_typewriter.room",
              volume: seededVolume({ seed, tag: `room:${event.at}`, base: roomVol, var: roomVar }),
              bus: "sfx",
              loop: true,
              duration: roomDur ?? roomDurationFrames,
            }),
          );
        }
        return out;
      }
      case "TYPEWRITER_KEY": {
        const payload = (event.payload ?? {}) as {
          ch?: string;
          seed?: number;
          noAutoWrap?: boolean;
          audio?: Partial<{
            baseKeyVol: number;
            baseSpaceVol: number;
            basePunctVol: number;
            baseBackspaceVol: number;
            baseCarriageVol: number;
            baseBellVol: number;
            volVar: number;
            durKeyS: number;
            durSpaceS: number;
            durPunctS: number;
          }>;
        };
        const ch = typeof payload.ch === "string" ? payload.ch : "";
        const seed = typeof payload.seed === "number" ? payload.seed : hashStringToU32(`${event.at}:${event._declarationOrder ?? 0}`);
        const cat = categorizeSoundForChar(ch);
        const volVar = payload.audio?.volVar ?? 0.12;
        const base =
          cat === "space"
            ? payload.audio?.baseSpaceVol ?? baseVolumeForCategory("space")
            : cat === "punct"
              ? payload.audio?.basePunctVol ?? baseVolumeForCategory("punct")
              : payload.audio?.baseKeyVol ?? baseVolumeForCategory("key");
        return [
          createRuntimeEvent(event.at, deviceId, event.type, {
            ch,
            noAutoWrap: payload.noAutoWrap === true,
          }),
          createAudioEvent(event.at, deviceId, {
            soundId: soundIdForCategory(cat),
            volume: seededVolume({
              seed,
              tag: `${cat}:${ch}:${event.at}`,
              base,
              var: volVar,
            }),
            bus: "sfx",
            duration:
              cat === "space"
                ? durFrames(payload.audio?.durSpaceS ?? 0.1, ctx.fps)
                : cat === "punct"
                  ? durFrames(payload.audio?.durPunctS ?? 0.05, ctx.fps)
                  : durFrames(payload.audio?.durKeyS ?? 0.05, ctx.fps),
          }),
        ];
      }
      case "TYPEWRITER_NEWLINE": {
        const payload = (event.payload ?? {}) as { audio?: { baseCarriageVol?: number; volVar?: number; durCarriageS?: number } };
        const seed = hashStringToU32(`${event.at}:${event._declarationOrder ?? 0}`);
        return [
          createRuntimeEvent(event.at, deviceId, event.type, event.payload ?? {}),
          createAudioEvent(event.at, deviceId, {
            soundId: "app_typewriter.carriage",
            volume: seededVolume({
              seed,
              tag: `ret:${event.at}`,
              base: payload.audio?.baseCarriageVol ?? 0.95,
              var: Math.min(0.12, payload.audio?.volVar ?? 0.06),
            }),
            bus: "sfx",
            duration: durFrames(payload.audio?.durCarriageS ?? 0.3, ctx.fps),
          }),
        ];
      }
      case "TYPEWRITER_BACKSPACE": {
        const payload = (event.payload ?? {}) as { audio?: { baseBackspaceVol?: number; volVar?: number; durBackspaceS?: number } };
        const seed = hashStringToU32(`${event.at}:${event._declarationOrder ?? 0}`);
        return [
          createRuntimeEvent(event.at, deviceId, event.type, event.payload ?? {}),
          createAudioEvent(event.at, deviceId, {
            soundId: "app_typewriter.backspace",
            volume: seededVolume({
              seed,
              tag: `bksp:${event.at}`,
              base: payload.audio?.baseBackspaceVol ?? 0.8,
              var: Math.min(0.12, payload.audio?.volVar ?? 0.08),
            }),
            bus: "sfx",
            duration: durFrames(payload.audio?.durBackspaceS ?? 0.06, ctx.fps),
          }),
        ];
      }
      case "TYPEWRITER_SET_CURSOR":
      case "TYPEWRITER_SCROLL":
        return [createRuntimeEvent(event.at, deviceId, event.type, event.payload ?? {})];
      default:
        return [];
    }
  },
};
