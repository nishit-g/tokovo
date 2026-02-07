import { describe, expect, it } from "vitest";
import { typewriterLowering } from "../lowering/index.js";
import { TYPEWRITER_APP_ID } from "../constants.js";

describe("typewriterLowering", () => {
  it("expands TYPE_TEXT deterministically into KEY/NEWLINE runtime events", () => {
    const ev = {
      at: 10,
      kind: "APP",
      appId: TYPEWRITER_APP_ID,
      type: "TYPEWRITER_TYPE_TEXT",
      payload: { text: "A\nB", cps: 30 },
      deviceId: "desk",
      _declarationOrder: 0,
    } as any;

    const out = typewriterLowering.lower(ev, { fps: 30 });
    expect(out.map((e: any) => [e.at, e.type, e.payload?.ch ?? null])).toEqual([
      [10, "TYPEWRITER_KEY", "A"],
      [11, "TYPEWRITER_NEWLINE", null],
      [12, "TYPEWRITER_KEY", "B"],
    ]);
  });
});

