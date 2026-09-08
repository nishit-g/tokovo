import { TOKOVO_CAST_VOICES } from "./presets.js";
import type {
  BlurbChatIntent,
  BlurbEmotion,
  BlurbScript,
  BlurbUtterance,
  BlurbVoice,
} from "./types.js";

export type BlurbSpeechAct =
  | "confirm"
  | "question"
  | "warning"
  | "realize"
  | "apologize"
  | "deny"
  | "confess"
  | "celebrate"
  | "protest"
  | "verdict";

export interface BlurbCharacterContext {
  stakes?: number;
  audience?: "private" | "group" | "public";
  interrupted?: boolean;
}

export interface BlurbCharacterLine {
  id: string;
  message: string;
  act: BlurbSpeechAct;
  tone?: BlurbEmotion;
  intensity?: number;
  intent?: BlurbChatIntent;
  context?: BlurbCharacterContext;
  seed?: string | number;
}

export interface BlurbCastLine extends BlurbCharacterLine {
  characterId: string;
}

export interface BlurbCharacterLanguage {
  phrases: Partial<Record<BlurbSpeechAct, readonly (readonly string[])[]>>;
}

export interface BlurbCharacter {
  id: string;
  voice: BlurbVoice;
  expressiveness: number;
  language: BlurbCharacterLanguage;
}

interface ActDirection {
  tone: BlurbEmotion;
  intent: BlurbChatIntent;
}

const ACT_DIRECTIONS: Record<BlurbSpeechAct, ActDirection> = {
  confirm: { tone: "excited", intent: "eager-confirmation" },
  question: { tone: "confused", intent: "hesitant-question" },
  warning: { tone: "panic", intent: "urgent-warning" },
  realize: { tone: "confused", intent: "delayed-realization" },
  apologize: { tone: "sad", intent: "tiny-confession" },
  deny: { tone: "annoyed", intent: "interrupted-protest" },
  confess: { tone: "sad", intent: "tiny-confession" },
  celebrate: { tone: "excited", intent: "eager-confirmation" },
  protest: { tone: "angry", intent: "interrupted-protest" },
  verdict: { tone: "deadpan", intent: "deadpan-verdict" },
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function desiredLexemeCount(line: BlurbCharacterLine, tone: BlurbEmotion): number {
  const words = line.message.trim().split(/\s+/).filter(Boolean).length;
  const messageWeight = words >= 8 ? 2 : words >= 3 ? 1 : 0;
  const emotionalWeight = tone === "excited" || tone === "panic" || tone === "angry" ? 1 : 0;
  return clamp(1 + messageWeight + emotionalWeight, 1, 4);
}

function selectPhrase(
  character: BlurbCharacter,
  line: BlurbCharacterLine,
  tone: BlurbEmotion,
): readonly string[] {
  const phrases = character.language.phrases[line.act];
  if (!phrases || phrases.length === 0) {
    throw new Error(`Character "${character.id}" has no language for speech act "${line.act}".`);
  }

  const desired = desiredLexemeCount(line, tone);
  const closestDistance = Math.min(...phrases.map((phrase) => Math.abs(phrase.length - desired)));
  const candidates = phrases.filter(
    (phrase) => Math.abs(phrase.length - desired) === closestDistance,
  );
  const selector = stableHash(
    `${character.id}/${line.id}/${line.message}/${tone}/${line.seed ?? ""}`,
  );
  return candidates[selector % candidates.length];
}

function audienceIntensity(audience: BlurbCharacterContext["audience"]): number {
  if (audience === "public") return 0.12;
  if (audience === "group") return 0.06;
  return 0;
}

export function defineBlurbCharacter(character: BlurbCharacter): BlurbCharacter {
  if (!character.id.trim()) throw new Error("Character must have an id.");
  if (
    !Number.isFinite(character.expressiveness) ||
    character.expressiveness < 0 ||
    character.expressiveness > 1
  ) {
    throw new Error(`Character "${character.id}" expressiveness must be between 0 and 1.`);
  }

  for (const [act, phrases] of Object.entries(character.language.phrases)) {
    if (!phrases || phrases.length === 0) {
      throw new Error(`Character "${character.id}" has an empty phrase list for "${act}".`);
    }
    for (const phrase of phrases) {
      if (phrase.length === 0) {
        throw new Error(`Character "${character.id}" has an empty phrase for "${act}".`);
      }
      for (const lexeme of phrase) {
        if (!character.voice.syllables.includes(lexeme)) {
          throw new Error(
            `Character "${character.id}" phrase "${act}" uses unknown lexeme "${lexeme}".`,
          );
        }
      }
    }
  }

  return character;
}

export function createCharacterUtterance(
  character: BlurbCharacter,
  line: BlurbCharacterLine,
): BlurbUtterance {
  const defaults = ACT_DIRECTIONS[line.act];
  const tone = line.tone ?? defaults.tone;
  const stakes = clamp(line.context?.stakes ?? 0.4, 0, 1);
  const intensity =
    line.intensity ??
    clamp(
      character.expressiveness * 0.42 + stakes * 0.38 + audienceIntensity(line.context?.audience),
      0,
      1,
    );
  const intent =
    line.intent ?? (line.context?.interrupted ? "interrupted-protest" : defaults.intent);

  return {
    id: line.id,
    performer: character.id,
    text: line.message,
    intent,
    emotion: tone,
    intensity,
    lexemes: [...selectPhrase(character, line, tone)],
    seed: line.seed,
  };
}

export function createCharacterScript(
  id: string,
  character: BlurbCharacter,
  lines: readonly BlurbCharacterLine[],
  seed: string | number = id,
): BlurbScript {
  return {
    id,
    seed,
    voices: { [character.id]: character.voice },
    utterances: lines.map((line) => createCharacterUtterance(character, line)),
  };
}

export function createCastScript(
  id: string,
  characters: readonly BlurbCharacter[],
  lines: readonly BlurbCastLine[],
  seed: string | number = id,
): BlurbScript {
  const charactersById = new Map<string, BlurbCharacter>();
  for (const character of characters) {
    if (charactersById.has(character.id)) {
      throw new Error(`Cast script "${id}" contains duplicate character "${character.id}".`);
    }
    charactersById.set(character.id, character);
  }

  return {
    id,
    seed,
    voices: Object.fromEntries(characters.map((character) => [character.id, character.voice])),
    utterances: lines.map(({ characterId, ...line }) => {
      const character = charactersById.get(characterId);
      if (!character) {
        throw new Error(
          `Cast script "${id}" line "${line.id}" references unknown character "${characterId}".`,
        );
      }
      return createCharacterUtterance(character, line);
    }),
  };
}

export const MINT_SPRITE_CHARACTER = defineBlurbCharacter({
  id: "mint",
  voice: TOKOVO_CAST_VOICES["mint-sprite"],
  expressiveness: 0.78,
  language: {
    phrases: {
      confirm: [["mibi"], ["mibi", "mibi"], ["mibi", "mibi", "yip"]],
      question: [["bwo"], ["bwo", "mibi"], ["bwo", "nup"]],
      warning: [["tik"], ["tik", "tik"], ["bwee", "tik"]],
      realize: [
        ["bwo", "tik"],
        ["bwo", "tik", "tik"],
        ["bwo", "nono", "tik", "tik"],
      ],
      apologize: [["mwa"], ["mwa", "mibi"], ["mwa", "mwa"]],
      deny: [["nono"], ["nono", "tik"], ["nono", "nono"]],
      confess: [
        ["mwa", "nono"],
        ["mwa", "mibi", "nono"],
      ],
      celebrate: [
        ["mibi", "yip"],
        ["pipi", "mibi", "yip"],
      ],
      protest: [["nup"], ["nup", "nono"]],
      verdict: [["tik"], ["nono"]],
    },
  },
});

export const PING_COURIER_CHARACTER = defineBlurbCharacter({
  id: "ping",
  voice: TOKOVO_CAST_VOICES["ping-courier"],
  expressiveness: 0.72,
  language: {
    phrases: {
      confirm: [["pim"], ["pim", "billo"], ["pim", "pim", "lo"]],
      question: [
        ["mm", "pillo"],
        ["pillo", "eh"],
        ["bim", "lo"],
      ],
      warning: [["tup"], ["tup", "tup"], ["wim", "tup"]],
      realize: [
        ["bim", "nolla"],
        ["bim", "nolla", "eh"],
        ["pillo", "nolla", "rum"],
      ],
      apologize: [
        ["mm", "nolla"],
        ["moro", "nolla"],
      ],
      deny: [["nolla"], ["nolla", "tup"]],
      confess: [
        ["mm", "bim", "nolla"],
        ["moro", "nolla", "lo"],
      ],
      celebrate: [
        ["pim", "billo"],
        ["pim", "pim", "billo"],
      ],
      protest: [
        ["eh", "tup"],
        ["nolla", "nolla"],
      ],
      verdict: [["lo"], ["mm", "lo"]],
    },
  },
});

export const TEAL_MANAGER_CHARACTER = defineBlurbCharacter({
  id: "teal",
  voice: TOKOVO_CAST_VOICES["teal-manager"],
  expressiveness: 0.46,
  language: {
    phrases: {
      confirm: [["ka"], ["ka", "tok"]],
      question: [["hm"], ["hm", "dek"], ["hm", "dek", "vak"]],
      warning: [["dak"], ["dak", "tik"]],
      realize: [
        ["hm", "vak"],
        ["dek", "vak"],
      ],
      apologize: [["hm", "ko"]],
      deny: [["ko"], ["ko", "dak"]],
      confess: [["hm", "vak", "ko"]],
      celebrate: [["zip", "ka"]],
      protest: [["dak", "ko"]],
      verdict: [["tok"], ["tok", "hm"], ["tok", "vak", "hm"]],
    },
  },
});

export const VIOLET_FOUNDER_CHARACTER = defineBlurbCharacter({
  id: "violet",
  voice: TOKOVO_CAST_VOICES["violet-founder"],
  expressiveness: 0.28,
  language: {
    phrases: {
      confirm: [["mm"], ["mm", "vo"]],
      question: [["hm"], ["hm", "vo"]],
      warning: [["no"], ["no", "zun"]],
      realize: [["hm", "wom"]],
      apologize: [["mm", "ruh"]],
      deny: [["no"]],
      confess: [["hm", "dum"]],
      celebrate: [["vo", "mm"]],
      protest: [["no", "brr"]],
      verdict: [["zun"], ["mm", "no"], ["zun", "no"]],
    },
  },
});

export const TOKOVO_CHARACTERS = {
  "mint-sprite": MINT_SPRITE_CHARACTER,
  "ping-courier": PING_COURIER_CHARACTER,
  "teal-manager": TEAL_MANAGER_CHARACTER,
  "violet-founder": VIOLET_FOUNDER_CHARACTER,
} as const;

export type TokovoCharacterId = keyof typeof TOKOVO_CHARACTERS;
