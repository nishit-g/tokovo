import { expect, it } from "vitest";
import { create, type Font } from "fontkit";
import inter from "../fonts/inter-latin.js";
import { bodyTextRuns, measureBodyText } from "../text.js";

it("matches pinned font shaping including ligatures, kerning and changing numbers", () => {
  const font = create(
    Uint8Array.from(atob(inter), (char) => char.charCodeAt(0)) as Parameters<typeof create>[0],
  ) as Font;
  for (const text of [
    "AVATAR",
    "office affinity",
    "Message 9999",
    "18:30",
    "Dinner at the usual place?",
    "Yes. Booking for 7.",
  ]) {
    expect(measureBodyText(text, 17)).toBeCloseTo(
      (font.layout(text).advanceWidth / font.unitsPerEm) * 17,
      5,
    );
  }
  expect(measureBodyText("مرحبا بالعالم", 17)).toBeGreaterThan(0);
  expect(measureBodyText("नमस्ते दुनिया", 17)).toBeGreaterThan(0);
  expect(measureBodyText("नमस्ते दुनिया।", 17)).toBeGreaterThan(measureBodyText("नमस्ते दुनिया", 17));
  expect(measureBodyText("مرحبا، بالعالم", 17)).toBeGreaterThan(0);
  expect(measureBodyText("👨‍👩‍👧‍👦", 17)).toBe(21.25);
  expect(bodyTextRuns("Hi 👨‍👩‍👧‍👦!")).toEqual([
    { text: "Hi " },
    { text: "👨‍👩‍👧‍👦", cellWidth: 1.25 },
    { text: "!" },
  ]);
  for (const text of ["Привет", "Γεια", "Tiếng Việt"]) {
    expect(measureBodyText(text, 17)).toBeGreaterThan(0);
    expect(measureBodyText(text, 17, "Roboto Variable")).toBeGreaterThan(0);
  }
});
