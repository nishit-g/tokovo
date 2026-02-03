import { describe, expect, it } from "vitest";
import React from "react";
import { AppSurface } from "../components/AppSurface";

describe("AppSurface", () => {
  it("computes scale and inner layout from design and target sizes", () => {
    const element = AppSurface({
      designWidth: 200,
      targetWidth: 400,
      targetHeight: 800,
      backgroundColor: "#123",
      style: { borderRadius: 12 },
      children: React.createElement("span", null, "child"),
    });

    expect(element.type).toBe("div");
    expect(element.props.style.width).toBe(400);
    expect(element.props.style.height).toBe(800);
    expect(element.props.style.backgroundColor).toBe("#123");
    expect(element.props.style.borderRadius).toBe(12);

    const inner = element.props.children as React.ReactElement;
    expect(inner.props.style.width).toBe(200);
    expect(inner.props.style.height).toBe(400);
    expect(inner.props.style.transform).toBe("scale(2)");
    expect(inner.props.children.type).toBe("span");
  });

  it("falls back to defaults when design width is falsy", () => {
    const element = AppSurface({
      designWidth: 0,
      children: React.createElement("div"),
    });

    expect(element.props.style.width).toBe(393);
    expect(element.props.style.height).toBe(852);

    const inner = element.props.children as React.ReactElement;
    expect(inner.props.style.width).toBe(393);
    expect(inner.props.style.transform).toBe("scale(1)");
  });
});
