import { describe, expect, it } from "vitest";

import type { AnchorSnapshot } from "@tokovo/device-camera";
import type { InputProjection } from "@tokovo/device-keyboard";

import { mergeInputProjectionAnchor } from "../engines/useCameraEngine.js";

const snapshot: AnchorSnapshot = {
  appId: "app_whatsapp",
  deviceId: "phone",
  anchors: {
    app: { x: 0, y: 0, width: 1179, height: 2556 },
  },
};

function projection(
  visible: boolean,
  viewportInset: number,
): InputProjection {
  return {
    surface: { visible, viewportInset },
  } as InputProjection;
}

describe("input projection camera anchor", () => {
  it("derives the visible keyboard rect from the random-access projection", () => {
    const result = mergeInputProjectionAnchor(
      snapshot,
      projection(true, 870),
      { width: 1179, height: 2556 },
    );

    expect(result.anchors.keyboard).toEqual({
      x: 0,
      y: 1686,
      width: 1179,
      height: 870,
    });
    expect(result.anchors.app).toEqual(snapshot.anchors.app);
  });

  it("does not expose a zero-area anchor while the surface is hidden", () => {
    expect(
      mergeInputProjectionAnchor(snapshot, projection(false, 0), {
        width: 1179,
        height: 2556,
      }),
    ).toBe(snapshot);
  });
});
