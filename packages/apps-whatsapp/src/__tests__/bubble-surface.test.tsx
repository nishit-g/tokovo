import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { BubbleSurface } from "../components/MessageBubblePrimitives.js";

it("draws body and tail as one mirrored silhouette, only at the start of a run", () => {
  for (const isMe of [true, false]) {
    for (const position of ["single", "start", "middle", "end"] as const) {
      const html = renderToStaticMarkup(<BubbleSurface width={120} height={48} position={position} isMe={isMe} fill="#DCF8C6" border="#00000010" radius={12} />);
      expect(html.match(/<path\b/g)).toHaveLength(1);
      expect(html).toContain(`data-bubble-surface="${position === "single" || position === "start" ? "tail" : "joined"}"`);
      expect(html.includes("scale(-1 1)")).toBe(!isMe);
      expect(html).toContain('fill="#DCF8C6"');
    }
  }
});
