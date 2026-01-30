export interface ElevenLabsTextToDialogueRequest {
  model_id: string;
  inputs: Array<{
    text: string;
    voice_id: string;
  }>;
}

export interface ElevenLabsVoiceSegment {
  voice_id: string;
  start_time_seconds: number;
  end_time_seconds: number;
  dialogue_input_index: number;
}

export interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface ElevenLabsTextToDialogueResponse {
  audio_base64: string;
  voice_segments: ElevenLabsVoiceSegment[];
  alignment?: ElevenLabsAlignment;
}

export interface ElevenLabsConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}
