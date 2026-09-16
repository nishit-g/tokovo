import { expect, it } from "vitest";
import { historyWindow } from "../ui/painters/MeasuredHistory.js";

it("windows measured history without discarding old rows or losing fractional heights", () => {
  const heights = Array.from({ length: 10_000 }, (_, index) => 90.25 + (index % 3));
  const start = historyWindow(heights, 700, 0, 40);
  const end = historyWindow(heights, 700, 1, 40);
  expect(start.rows.filter((row) => row.visible).length).toBeLessThan(15);
  expect(end.rows.filter((row) => row.visible).length).toBeLessThan(15);
  expect(end.rows.at(-1)?.visible).toBe(true);
  expect(end.offset + 700).toBe(end.total);
  expect(historyWindow(heights, 700, 0, 40)).toEqual(start);
});
