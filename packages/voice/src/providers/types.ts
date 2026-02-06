import { VoiceScript } from "../types/script.js";

export interface DialogueInput {
  text: string;
  voiceId: string;
}

export interface DialogueRequest {
  inputs: DialogueInput[];
  model?: string;
  outputFormat?: "mp3" | "wav";
}

export interface SegmentTiming {
  index: number;
  voiceId: string;
  startMs: number;
  endMs: number;
}

export interface AlignmentData {
  characters: string[];
  startTimesSeconds: number[];
  endTimesSeconds: number[];
}

export interface DialogueResult {
  audioBuffer: Buffer;
  durationMs: number;
  segments: SegmentTiming[];
  alignment?: AlignmentData;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TTSProvider {
  name: string;
  generateDialogue(request: DialogueRequest): Promise<DialogueResult>;
  estimateCost(script: VoiceScript): number;
  validateScript(script: VoiceScript): ValidationResult;
}
