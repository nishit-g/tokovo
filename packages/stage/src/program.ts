import { StageProgramSchema, type StageNodeIR, type StageProgramIR } from "@tokovo/ir";
import type { PreparedStageProgram, StageDiagnostic } from "./types.js";

export class StagePreparationError extends Error {
  readonly diagnostics: readonly StageDiagnostic[];

  constructor(diagnostics: readonly StageDiagnostic[]) {
    super(
      `Stage preparation failed with ${diagnostics.length} diagnostic(s): ${diagnostics
        .map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)
        .join(" | ")}`,
    );
    this.name = "StagePreparationError";
    this.diagnostics = diagnostics;
  }
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function diagnostic(code: string, message: string, nodeId?: string): StageDiagnostic {
  return { code, severity: "error", message, nodeId };
}

function hasOwnNode(nodesById: Readonly<Record<string, StageNodeIR>>, nodeId: string): boolean {
  return Object.prototype.hasOwnProperty.call(nodesById, nodeId);
}

function sortedProgram(source: StageProgramIR): StageProgramIR {
  return {
    ...source,
    nodes: [...source.nodes].sort((left, right) => left.id.localeCompare(right.id)),
    transformKeyframes: [...source.transformKeyframes].sort(
      (left, right) => left.nodeId.localeCompare(right.nodeId) || left.frame - right.frame,
    ),
  };
}

function topologicalOrder(
  rootNodeId: string,
  nodesById: Readonly<Record<string, StageNodeIR>>,
  diagnostics: StageDiagnostic[],
): readonly string[] {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const order: string[] = [];

  const visit = (nodeId: string): void => {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      diagnostics.push(
        diagnostic(
          "STAGE_PARENT_CYCLE",
          `Stage node "${nodeId}" participates in a parent cycle.`,
          nodeId,
        ),
      );
      return;
    }
    if (!hasOwnNode(nodesById, nodeId)) return;
    const node = nodesById[nodeId];
    visiting.add(nodeId);
    if (node.parentId) visit(node.parentId);
    visiting.delete(nodeId);
    visited.add(nodeId);
    order.push(nodeId);
  };

  visit(rootNodeId);
  for (const nodeId of Object.keys(nodesById).sort()) visit(nodeId);
  return order;
}

export function prepareStageProgram(source: StageProgramIR): PreparedStageProgram {
  const diagnostics: StageDiagnostic[] = [];
  const parsed = StageProgramSchema.safeParse(source);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        diagnostic("STAGE_SCHEMA_INVALID", `${issue.path.join(".") || "stage"}: ${issue.message}`),
      );
    }
    throw new StagePreparationError(diagnostics);
  }
  const program = sortedProgram(parsed.data);
  const seenNodeIds = new Set<string>();
  for (const node of program.nodes) {
    if (seenNodeIds.has(node.id)) {
      diagnostics.push(
        diagnostic("STAGE_NODE_DUPLICATE", `Duplicate stage node id "${node.id}".`, node.id),
      );
    }
    seenNodeIds.add(node.id);
  }
  const nodesById: Readonly<Record<string, StageNodeIR>> = Object.fromEntries(
    program.nodes.map((node) => [node.id, node] as const),
  );
  if (!hasOwnNode(nodesById, program.rootNodeId)) {
    diagnostics.push(
      diagnostic(
        "STAGE_ROOT_MISSING",
        `Root stage node "${program.rootNodeId}" does not exist.`,
        program.rootNodeId,
      ),
    );
  }
  for (const node of program.nodes) {
    if (node.parentId && !hasOwnNode(nodesById, node.parentId)) {
      diagnostics.push(
        diagnostic(
          "STAGE_PARENT_MISSING",
          `Stage node "${node.id}" references missing parent "${node.parentId}".`,
          node.id,
        ),
      );
    }
    if (node.id !== program.rootNodeId && !node.parentId) {
      diagnostics.push(
        diagnostic(
          "STAGE_NODE_ORPHANED",
          `Non-root stage node "${node.id}" must declare a parent.`,
          node.id,
        ),
      );
    }
  }
  const seenKeyframes = new Set<string>();
  for (const keyframe of program.transformKeyframes) {
    if (!hasOwnNode(nodesById, keyframe.nodeId)) {
      diagnostics.push(
        diagnostic(
          "STAGE_KEYFRAME_NODE_MISSING",
          `Stage keyframe references missing node "${keyframe.nodeId}".`,
          keyframe.nodeId,
        ),
      );
    }
    const key = `${keyframe.nodeId}:${keyframe.frame}`;
    if (seenKeyframes.has(key)) {
      diagnostics.push(
        diagnostic(
          "STAGE_KEYFRAME_DUPLICATE",
          `Stage node "${keyframe.nodeId}" has multiple keyframes at frame ${keyframe.frame}.`,
          keyframe.nodeId,
        ),
      );
    }
    seenKeyframes.add(key);
  }

  const nodeOrder = topologicalOrder(program.rootNodeId, nodesById, diagnostics);
  if (diagnostics.some((entry) => entry.severity === "error")) {
    throw new StagePreparationError(diagnostics);
  }

  const paintOrder = [...program.nodes]
    .sort((left, right) => left.zIndex - right.zIndex || left.id.localeCompare(right.id))
    .map((node) => node.id);
  const keyframeIndexesByNode = Object.fromEntries(
    program.nodes.map((node) => [node.id, [] as number[]] as const),
  );
  for (const [keyframeIndex, keyframe] of program.transformKeyframes.entries()) {
    keyframeIndexesByNode[keyframe.nodeId]?.push(keyframeIndex);
  }

  return {
    version: 2,
    program,
    nodesById,
    nodeOrder,
    paintOrder,
    keyframeIndexesByNode,
    signature: hashString(stableSerialize(program)),
    diagnostics,
  };
}
