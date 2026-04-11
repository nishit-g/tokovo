import {
  EpisodeSchemaV1,
  TimelineEventSchema,
  MessageSchema,
  DeviceStateSchema,
  ConversationStateSchema,
  CameraViewSchema,
  MessageMetadataSchema,
  CustomEventPayloadSchema,
  AppStateSchema,
} from "./schema.js";

function toJsonSchema(schema: { toJSONSchema: () => object }): object {
  return schema.toJSONSchema();
}

export interface SchemaExport {
  $schema: string;
  title: string;
  description: string;
  version: string;
  generatedAt: string;
  schemas: {
    episode: object;
    timelineEvent: object;
    message: object;
    deviceState: object;
    conversationState: object;
    cameraView: object;
    messageMetadata: object;
    customEventPayload: object;
    appState: object;
  };
}

export function generateJsonSchemas(): SchemaExport {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Tokovo Episode Schema",
    description:
      "JSON Schema for Tokovo episode format. Use this to validate AI-generated episodes.",
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    schemas: {
      episode: toJsonSchema(EpisodeSchemaV1),
      timelineEvent: toJsonSchema(TimelineEventSchema),
      message: toJsonSchema(MessageSchema),
      deviceState: toJsonSchema(DeviceStateSchema),
      conversationState: toJsonSchema(ConversationStateSchema),
      cameraView: toJsonSchema(CameraViewSchema),
      messageMetadata: toJsonSchema(MessageMetadataSchema),
      customEventPayload: toJsonSchema(CustomEventPayloadSchema),
      appState: toJsonSchema(AppStateSchema),
    },
  };
}

export function getEpisodeJsonSchema(): object {
  return toJsonSchema(EpisodeSchemaV1);
}

export function getTimelineEventJsonSchema(): object {
  return toJsonSchema(TimelineEventSchema);
}

export function formatSchemaForPrompt(schema: object): string {
  return JSON.stringify(schema, null, 2);
}

export function generatePromptDocumentation(): string {
  const episodeSchema = getEpisodeJsonSchema();

  return `# Tokovo Episode Format

## Overview
Tokovo episodes are JSON documents that describe mobile app screen recordings.
They contain an initial world state and a timeline of events.

## Schema
\`\`\`json
${formatSchemaForPrompt(episodeSchema)}
\`\`\`

## Event Kinds
- DEVICE: Device state changes (app open, scroll, etc.)
- CAMERA: Camera movements and transitions
- AUDIO: Audio playback and sound effects
- APP: App-specific events (messages, notifications)
- OS: Operating system events (notifications)
- CALL: Phone call events

## Validation
All episodes MUST pass validation before rendering.
Use the dry-run mode to validate without rendering:
\`\`\`bash
tokovo-validate episode.json
\`\`\`
`;
}
