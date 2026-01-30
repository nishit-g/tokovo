/**
 * Voice Manifest Types
 *
 * Defines the output format from voice generation.
 * The manifest provides timing information for each segment.
 */

// =============================================================================
// MANIFEST TYPES
// =============================================================================

/**
 * Complete manifest output from voice generation
 */
export interface VoiceManifest {
  /** Original script ID */
  scriptId: string;

  /** Path to generated audio file (relative) */
  audioFile: string;

  /** Total duration in milliseconds */
  durationMs: number;

  /** Generation timestamp */
  generatedAt: string;

  /** Provider used (e.g., "elevenlabs") */
  provider: string;

  /** Model used (e.g., "eleven_v3") */
  model: string;

  /** Individual segment timing */
  segments: VoiceSegment[];

  /** Character-level alignment for captions (optional) */
  alignment?: VoiceAlignment;

  /** Content hash for cache validation */
  contentHash: string;
}

/**
 * Single voice segment with timing
 */
export interface VoiceSegment {
  /** Segment index (0-based) */
  index: number;

  /** Segment ID for DSL reference (e.g., "seg_0") */
  id: string;

  /** Speaker name from script */
  speaker: string;

  /** Original text (with emotion tags) */
  text: string;

  /** Start time in milliseconds */
  startMs: number;

  /** End time in milliseconds */
  endMs: number;

  /** Duration in milliseconds */
  durationMs: number;
}

/**
 * Character-level alignment for captions
 * Used in Phase 2 for TikTok-style word highlighting
 */
export interface VoiceAlignment {
  /** Individual characters */
  characters: string[];

  /** Start time for each character in milliseconds */
  startTimesMs: number[];

  /** End time for each character in milliseconds */
  endTimesMs: number[];
}

// =============================================================================
// WORD-LEVEL TIMING (for future captions)
// =============================================================================

/**
 * Word timing extracted from character alignment
 */
export interface WordTiming {
  text: string;
  startMs: number;
  endMs: number;
}

/**
 * Extract word timings from character alignment
 * Used for TikTok-style caption generation
 */
export function extractWordTimings(alignment: VoiceAlignment): WordTiming[] {
  const words: WordTiming[] = [];
  let currentWord = "";
  let wordStart = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startMs = alignment.startTimesMs[i];
    const endMs = alignment.endTimesMs[i];

    if (char === " " || char === "\n") {
      if (currentWord) {
        words.push({
          text: currentWord,
          startMs: wordStart,
          endMs: alignment.endTimesMs[i - 1],
        });
        currentWord = "";
      }
    } else {
      if (!currentWord) {
        wordStart = startMs;
      }
      currentWord += char;
    }
  }

  // Don't forget last word
  if (currentWord) {
    words.push({
      text: currentWord,
      startMs: wordStart,
      endMs: alignment.endTimesMs[alignment.endTimesMs.length - 1],
    });
  }

  return words;
}
