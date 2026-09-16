import React, { useLayoutEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export function historyWindow(
  heights: readonly number[],
  viewport: number,
  position: number,
  header: number,
) {
  const total = header + heights.reduce((sum, height) => sum + height, 0);
  const offset = Math.max(0, total - viewport) * Math.max(0, Math.min(1, position));
  let top = header;
  const rows = heights.map((height, index) => {
    const row = {
      index,
      top,
      visible: top + height >= offset - 200 && top <= offset + viewport + 200,
    };
    top += height;
    return row;
  });
  return { total, offset, rows };
}

/** Measure changed rows before capture; reuse exact CSS heights on subsequent frames. */
export function MeasuredHistory({
  keys,
  renderRow,
  header,
  height,
  position,
  contextKey,
}: {
  keys: readonly string[];
  renderRow(index: number): React.ReactNode;
  header: React.ReactNode;
  height: number;
  position: number;
  contextKey: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const measurements = useRef(new Map<string, number>());
  const [, refresh] = useState(0);
  const rowKeys = keys.map((key) => `${contextKey}:${key}`);
  const headerKey = `${contextKey}:header`;
  const missing =
    rowKeys.some((key) => !measurements.current.has(key)) || !measurements.current.has(headerKey);
  useLayoutEffect(() => {
    if (!missing) return;
    const handle = delayRender("Measure notification history rows");
    let disposed = false;
    void document.fonts.ready
      .then(() => {
        if (disposed || !root.current) return;
        for (const node of root.current.querySelectorAll<HTMLElement>("[data-history-measure]")) {
          const key = node.dataset.historyMeasure!;
          const value = Number.parseFloat(getComputedStyle(node).height);
          if (!Number.isFinite(value)) throw new Error("NOTIFICATION_HISTORY_HEIGHT_INVALID");
          measurements.current.set(key, value);
        }
        // Retain only this history's current shapes, not every animation frame.
        const live = new Set([...rowKeys, headerKey]);
        for (const key of measurements.current.keys())
          if (!live.has(key)) measurements.current.delete(key);
        refresh((value) => value + 1);
        // Cleanup releases capture after the measured replacement DOM commits.
      })
      .catch(cancelRender);
    return () => {
      disposed = true;
      continueRender(handle);
    };
  });
  const layout = historyWindow(
    rowKeys.map((key) => measurements.current.get(key) ?? 0),
    height,
    position,
    measurements.current.get(headerKey) ?? 0,
  );
  return (
    <div
      ref={root}
      data-notification-history-content
      style={{
        position: "relative",
        height: missing ? undefined : layout.total,
        flexShrink: 0,
        transform: `translateY(${-layout.offset}px)`,
      }}
    >
      {missing ? (
        <div style={{ visibility: "hidden" }}>
          {!measurements.current.has(headerKey) && (
            <div data-history-measure={headerKey} style={{ display: "flow-root" }}>
              {header}
            </div>
          )}
          {rowKeys.map(
            (key, index) =>
              !measurements.current.has(key) && (
                <div key={key} data-history-measure={key} style={{ display: "flow-root" }}>
                  {renderRow(index)}
                </div>
              ),
          )}
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", top: 0, width: "100%" }}>{header}</div>
          {layout.rows
            .filter((row) => row.visible)
            .map((row) => (
              <div
                key={row.index}
                data-history-visible-row
                style={{ position: "absolute", top: row.top, width: "100%" }}
              >
                {renderRow(row.index)}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
