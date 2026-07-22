import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";
import { encodeCameraTextureProjectionCapture } from "video-runner/camera-texture-contract";
import type { CameraTextureProjectionCapture } from "video-runner/camera-texture-contract";

import {
  CameraTextureCaptureCollector,
  composeWarpDisplacement,
  createCameraCommandFile,
  createOpticalDisplacementMapPlanes,
  createPerspectiveCorners,
  createTextureFilterGraph,
  encodeGrayscalePng,
} from "./camera-texture-compositor";

function capture(
  frame: number,
  projectionPasses: CameraTextureProjectionCapture["outputs"][number]["projectionPasses"] = [],
): CameraTextureProjectionCapture {
  return {
    version: 3,
    frame,
    storySignature: "story-a",
    stageSignature: "stage-a",
    cameraSignature: "camera-a",
    planId: "expressive",
    stage: { width: 1080, height: 1920 },
    outputs: [
      {
        outputId: "main",
        sourceStageNodeId: "stage.root",
        zIndex: 0,
        viewport: { x: 0, y: 0, width: 1080, height: 1920 },
        viewMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        opacity: 1,
        clipRadiusPx: 0,
        projectionPasses,
      },
    ],
  };
}

function multiOutputCapture(frame: number): CameraTextureProjectionCapture {
  const source = capture(frame);
  return {
    ...source,
    outputs: [
      ...source.outputs,
      {
        outputId: "pip",
        sourceStageNodeId: "stage.root",
        zIndex: 20,
        viewport: { x: 684, y: 124, width: 324, height: 576 },
        viewMatrix: [0.5, 0, 684, 0, 0.5, 124, 0, 0, 1],
        opacity: 0.92,
        clipRadiusPx: 42,
        shadow: { offsetX: 0, offsetY: 14, blurPx: 20, opacity: 0.5 },
        projectionPasses: [
          {
            kind: "fisheye-warp",
            center: [0.5, 0.5],
            strength: 0.08,
            radius: 1.1,
            cropCompensation: 1.025,
          },
        ],
      },
    ],
  };
}

describe("camera texture capture", () => {
  it("deduplicates identical browser emissions and requires every frame", () => {
    const collector = new CameraTextureCaptureCollector();
    for (const frame of [1, 0, 1]) {
      collector.acceptBrowserLog(
        `browser: ${encodeCameraTextureProjectionCapture(capture(frame))}`,
      );
    }
    expect(collector.complete(2).map((entry) => entry.frame)).toEqual([0, 1]);
    expect(() => collector.complete(3)).toThrow("frame 2");
  });

  it("completes focused source ranges in local sequence order", () => {
    const collector = new CameraTextureCaptureCollector();
    for (const frame of [101, 100, 102]) {
      collector.acceptBrowserLog(encodeCameraTextureProjectionCapture(capture(frame)));
    }
    expect(collector.completeRange(100, 102).map((entry) => entry.frame)).toEqual([100, 101, 102]);
    expect(() => collector.completeRange(102, 100)).toThrow("RANGE_INVALID");
  });

  it("rejects conflicting data for one frame", () => {
    const collector = new CameraTextureCaptureCollector();
    collector.acceptBrowserLog(encodeCameraTextureProjectionCapture(capture(0)));
    expect(() =>
      collector.acceptBrowserLog(
        encodeCameraTextureProjectionCapture({
          ...capture(0),
          cameraSignature: "different",
        }),
      ),
    ).toThrow("NONDETERMINISTIC");
  });

  it("rejects output topology changes inside one capture range", () => {
    const collector = new CameraTextureCaptureCollector();
    collector.acceptBrowserLog(encodeCameraTextureProjectionCapture(multiOutputCapture(0)));
    collector.acceptBrowserLog(encodeCameraTextureProjectionCapture(capture(1)));
    expect(() => collector.complete(2)).toThrow("IDENTITY_CHANGED");
  });
});

describe("camera perspective and optical maps", () => {
  const radial = {
    kind: "radial-warp" as const,
    model: "barrel" as const,
    center: [0.5, 0.5] as const,
    strength: 0.2,
    radius: 1,
    cropCompensation: 1.04,
  };

  it("keeps the optical center fixed and moves off-axis samples", () => {
    expect(
      composeWarpDisplacement({
        x: 0.5,
        y: 0.5,
        viewport: { width: 1080, height: 1920 },
        passes: [radial],
      }),
    ).toEqual([0, 0]);
    const displaced = composeWarpDisplacement({
      x: 0.75,
      y: 0.5,
      viewport: { width: 1080, height: 1920 },
      passes: [radial],
    });
    expect(displaced[0]).toBeGreaterThan(0);
    expect(displaced[1]).toBe(0);
  });

  it("maps reusable stage corners through affine framing", () => {
    const neutral = createPerspectiveCorners(capture(0), "main");
    expect(neutral).toEqual({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 1080, y: 0 },
      bottomLeft: { x: 0, y: 1920 },
      bottomRight: { x: 1080, y: 1920 },
    });

    const framed = capture(0);
    framed.outputs[0].viewMatrix = [2, 0, 0, 0, 2, 0, 0, 0, 1];
    expect(createPerspectiveCorners(framed, "main")).toEqual({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 2160, y: 0 },
      bottomLeft: { x: 0, y: 3840 },
      bottomRight: { x: 2160, y: 3840 },
    });
  });

  it("moves projective tilt into the high-quality corner homography", () => {
    const projective = {
      kind: "projective-warp" as const,
      tiltXDeg: 3.5,
      tiltYDeg: -2.5,
      perspectivePx: 1800,
      cropCompensation: 1.025,
    };
    const corners = createPerspectiveCorners(capture(0, [projective]), "main");
    expect(corners.topLeft.x).not.toBe(0);
    expect(corners.topRight.y).not.toBe(0);
    expect(corners.bottomRight.x).not.toBe(1080);
  });

  it("produces deterministic neutral and warped raster planes", () => {
    const neutral = createOpticalDisplacementMapPlanes({
      capture: capture(0),
      outputId: "main",
      compositionWidth: 1080,
      compositionHeight: 1920,
      mapWidth: 8,
      mapHeight: 8,
    });
    expect([...neutral.x]).toEqual(new Array(64).fill(128));
    expect([...neutral.y]).toEqual(new Array(64).fill(128));

    const warped = createOpticalDisplacementMapPlanes({
      capture: capture(0, [radial]),
      outputId: "main",
      compositionWidth: 1080,
      compositionHeight: 1920,
      mapWidth: 8,
      mapHeight: 8,
    });
    expect(warped.x).not.toEqual(neutral.x);
    const first = encodeGrayscalePng(8, 8, warped.x);
    const second = encodeGrayscalePng(8, 8, warped.x);
    expect(createHash("sha256").update(first).digest("hex")).toBe(
      createHash("sha256").update(second).digest("hex"),
    );
  });

  it("builds independent maps for inset outputs", () => {
    const planes = createOpticalDisplacementMapPlanes({
      capture: multiOutputCapture(0),
      outputId: "pip",
      compositionWidth: 1080,
      compositionHeight: 1920,
      mapWidth: 8,
      mapHeight: 8,
    });
    expect([...planes.x]).not.toEqual(new Array(64).fill(128));
    expect(() => createPerspectiveCorners(multiOutputCapture(0), "missing")).toThrow(
      "OUTPUT_MISSING",
    );
  });
});

describe("camera smear and FFmpeg graph", () => {
  it("emits frame-addressed commands and named filter targets", () => {
    const commands = createCameraCommandFile(
      [
        capture(0),
        capture(1, [
          {
            kind: "directional-smear",
            direction: [-1, 0.12],
            spreadPx: 28,
            samples: 6,
            decay: 0.68,
          },
        ]),
      ],
      30,
    );
    expect(commands).toContain("0.033333333 [enter]");
    expect(commands).toContain("perspective@tokovo_camera_0 x0");
    expect(commands).toContain("perspective@tokovo_camera_0 y3");
    expect(commands).toContain("gblur@tokovo_smear_0 sigma");
    expect(commands).toContain("colorchannelmixer@tokovo_camera_opacity_0 aa");
    expect(commands).toContain("colorchannelmixer@tokovo_smear_alpha_0 aa");
    expect(commands).toContain("overlay@tokovo_smear_overlay_0 x");
  });

  it("timestamps a focused source range from local zero", () => {
    const commands = createCameraCommandFile([capture(100), capture(101)], 30);
    expect(commands).toContain("0.000000000 [enter]");
    expect(commands).toContain("0.033333333 [enter]");
    expect(commands).not.toContain("3.333333333 [enter]");
  });

  it("keeps camera and foreground as separately attached layers", () => {
    const graph = createTextureFilterGraph({
      commandFile: "/tmp/tokovo/smear.sendcmd",
      initialCapture: capture(0),
      width: 1080,
      height: 1920,
    });
    expect(graph).toContain("[0:v]format=rgba[camera_canvas_0]");
    expect(graph).toContain("[camera_canvas_0][optical_0]overlay");
    expect(graph).toContain("[2:v]format=rgba[foreground]");
    expect(graph).toContain("[camera_canvas_1][foreground]overlay");
    expect(graph).toContain("perspective@tokovo_camera_0");
    expect(graph).toContain("interpolation=cubic");
    expect(graph).toContain("crop=1080:1920:0:0,format=rgba[framed_0]");
    expect(graph).not.toContain("[framed_0][xmap_0][ymap_0]displace");
    expect(graph).toContain(
      "[framed_0]format=rgba,colorchannelmixer@tokovo_camera_opacity_0=aa=1[warped_0]",
    );
    expect(graph).toContain("[optical_clipped_0]null[optical_0]");
    expect(graph).not.toContain("alphamerge");
    expect(graph).not.toContain("alphaextract");
    expect(graph).not.toContain("remap");
  });

  it("routes optics discovered after the first frame through a prepared map input", () => {
    const graph = createTextureFilterGraph({
      commandFile: "/tmp/tokovo/later-optics.sendcmd",
      initialCapture: capture(0),
      width: 1080,
      height: 1920,
      opticalOutputIds: ["main"],
    });

    expect(graph).toContain("[2:v]scale=1080:1920");
    expect(graph).toContain("[3:v]scale=1080:1920");
    expect(graph).toContain("[framed_0][xmap_0][ymap_0]displace");
    expect(graph).toContain("[4:v]format=rgba[foreground]");
  });

  it("orders independent full-frame and rounded PIP output pipelines", () => {
    const capture = multiOutputCapture(0);
    const commands = createCameraCommandFile([capture], 60);
    const graph = createTextureFilterGraph({
      commandFile: "/tmp/tokovo/multi.sendcmd",
      initialCapture: capture,
      width: 1080,
      height: 1920,
    });

    expect(commands).toContain("perspective@tokovo_camera_0");
    expect(commands).toContain("perspective@tokovo_camera_1");
    expect(graph).toContain("split=2[camera_source_0][camera_source_1]");
    expect(graph).toContain("crop=324:576:684:124,format=rgba[framed_1]");
    expect(graph).toContain("[2:v]scale=324:576");
    expect(graph).toContain("[3:v]scale=324:576");
    expect(graph).toContain("[framed_1][xmap_1][ymap_1]displace");
    expect(graph).toContain("geq=r='r(X,Y)'");
    expect(graph).toContain("[shadow_source_1]pad=404:656:40:40:color=black@0");
    expect(graph).toContain("pad=404:656:40:40:color=black@0");
    expect(graph).toContain("[camera_canvas_1][shadow_1]overlay=x=644:y=98");
    expect(graph).toContain("[camera_shadow_canvas_1][optical_1]overlay=x=684:y=124");
    expect(graph).toContain("[4:v]format=rgba[foreground]");
  });
});
