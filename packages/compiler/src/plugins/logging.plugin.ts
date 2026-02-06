import type { CompilerPlugin, CompilerContext } from "./types.js";
import type { TrackEvent } from "@tokovo/ir";

export class LoggingPlugin implements CompilerPlugin {
  name = "logging-plugin";
  version = "1.0.0";
  subscribesTo = ["*"];
  emits = [];

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    console.log(
      `[LoggingPlugin] Processing ${events.length} events at ${context.fps}fps`,
    );
    return [];
  }
}
