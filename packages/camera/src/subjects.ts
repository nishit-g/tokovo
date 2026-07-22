import type { CinematicSubjectRefIR } from "@tokovo/ir";

function part(value: string): string {
  return `${value.length}:${value}`;
}

/** Collision-safe stable identity used by preparation, evaluation, traces, and diagnostics. */
export function cinematicSubjectKey(ref: CinematicSubjectRefIR): string {
  switch (ref.kind) {
    case "semantic":
      return `s|${part(ref.deviceId)}|${part(ref.appId)}|${part(ref.subjectId)}`;
    case "entity":
      return `e|${part(ref.deviceId)}|${part(ref.appId)}|${part(ref.entityType)}|${part(ref.entityId)}|${part(ref.region)}`;
    case "device":
      return `d|${part(ref.deviceId)}|${part(ref.subjectId)}`;
    case "group":
      return `g|${ref.members.map((member) => part(cinematicSubjectKey(member))).join("|")}`;
  }
}
