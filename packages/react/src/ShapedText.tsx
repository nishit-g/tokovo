import React from "react";
import { bodyTextRuns } from "@tokovo/visual-system";

/** Keep native emoji/full-width cells independent of host fallback-font metrics. */
export function ShapedText({ text }: { text: string }) {
  return (
    <>
      {bodyTextRuns(text).map((run, index) =>
        run.cellWidth === undefined ? (
          run.text
        ) : (
          <span
            key={index}
            data-text-cell
            style={{
              display: "inline-block",
              width: `${run.cellWidth}em`,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {run.text}
          </span>
        ),
      )}
    </>
  );
}
