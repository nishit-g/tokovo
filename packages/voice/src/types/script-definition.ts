/**
 * Re-export voice script types from @tokovo/ir for backward compatibility.
 * The canonical definitions now live in @tokovo/ir to eliminate duplication.
 */

export type {
  VoiceScriptSegment,
  VoiceScriptDefinition,
  VoiceScheduleItem,
} from "@tokovo/ir";

export interface VoiceTrackConfig<T extends string = string> {
  script: import("@tokovo/ir").VoiceScriptDefinition<T>;
  schedule: import("@tokovo/ir").VoiceScheduleItem<T>[];
}
