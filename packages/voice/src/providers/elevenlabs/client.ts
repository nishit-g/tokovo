import {
  ElevenLabsConfig,
  ElevenLabsTextToDialogueRequest,
  ElevenLabsTextToDialogueResponse,
} from "./types";

const DEFAULT_BASE_URL = "https://api.elevenlabs.io";
const DEFAULT_MODEL = "eleven_v3";

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.model = config.model ?? DEFAULT_MODEL;
  }

  async textToDialogue(
    inputs: Array<{ text: string; voice_id: string }>,
  ): Promise<ElevenLabsTextToDialogueResponse> {
    const request: ElevenLabsTextToDialogueRequest = {
      model_id: this.model,
      inputs,
    };

    const response = await fetch(
      `${this.baseUrl}/v1/text-to-dialogue/with-timestamps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  getModel(): string {
    return this.model;
  }
}
