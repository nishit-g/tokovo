import { describe, expect, it } from "vitest";
import { episode } from "../index.js";

describe("creator episode compatibility", () => {
  it("keeps existing creator helpers unchanged", () => {
    const ep = episode("compat", {
      fps: 30,
      duration: "2s",
    });

    expect(typeof ep.whatsapp).toBe("function");
    expect(typeof ep.imessage).toBe("function");
    expect(typeof ep.snapchat).toBe("function");
    expect(typeof ep.x).toBe("function");
    expect(typeof ep.teams).toBe("function");

    ep.device("phone", "iphone16", { app: "app_x" });
    const ir = ep.build();
    expect(ir.devices).toHaveLength(1);
    expect(ir.devices[0].id).toBe("phone");
    expect(ir.devices[0].app).toBe("app_x");
  });
});

