import type {
  FullscreenLayoutState,
  LayoutContext,
  LayoutRect,
  SemanticRegion,
} from "@tokovo/core";

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

export function computeTeamsFullscreenLayout(
  ctx: LayoutContext,
): FullscreenLayoutState {
  const { viewportWidth: width, viewportHeight: height } = ctx;
  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, width, height), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, width, height), tags: ["app"] },
    teams_call_surface: {
      id: "teams_call_surface",
      rect: rect(0, 0, width, height),
      tags: ["call", "fullscreen"],
    },
    teams_call_header: {
      id: "teams_call_header",
      rect: rect(20, 20, width - 40, 96),
      tags: ["header"],
    },
    teams_call_grid: {
      id: "teams_call_grid",
      rect: rect(20, 132, width - 40, height - 260),
      tags: ["content"],
    },
    teams_call_controls: {
      id: "teams_call_controls",
      rect: rect(20, height - 108, width - 40, 72),
      tags: ["controls", "sticky"],
    },
  };

  return {
    kind: "FULLSCREEN",
    meta: {},
    semantic: {
      regions,
      groups: {
        call: ["teams_call_surface"],
      },
    },
  };
}
