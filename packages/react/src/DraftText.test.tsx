import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DraftText } from "./DraftText.js";

it("places the caret at grapheme selection, not always after the draft", () => {
  const html = renderToStaticMarkup(<DraftText text="Hi 👋🏽 there" selection={{ anchor: 3, focus: 4 }} focused frame={10} fps={30} accent="#007AFF" lineHeight={22} />);
  expect(html).toContain('data-draft-selection="true"');
  expect(html).toContain("width:1.25em");
  expect(html.indexOf("👋🏽")).toBeLessThan(html.indexOf("data-draft-caret"));
  expect(html.indexOf("data-draft-caret")).toBeLessThan(html.indexOf(" there"));
});

it("keeps multiline drafts intact instead of discarding lines before the caret", () => {
  const text = "First\nSecond\nThird\nFourth\nFifth";
  const html = renderToStaticMarkup(<DraftText text={text} selection={{ anchor: 0, focus: 0 }} focused frame={10} fps={30} accent="#007AFF" lineHeight={22} />);
  expect(html.indexOf("data-draft-caret")).toBeLessThan(html.indexOf("First"));
  expect(html).toContain(text);
  expect(html).toContain("max-height:88px");
});
