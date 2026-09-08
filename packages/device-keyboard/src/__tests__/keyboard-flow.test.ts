import { expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import { prepareInputSession, projectInputSession, findInputSessionForProjection, resolveInputKeyboardLayout } from "../index.js";

const config = { fps: 30, viewportWidth: 440, viewportHeight: 956, keyboardHeight: 336 };
const makeSession = (startFrame = 0) => prepareInputSession({ deviceId: "phone", appInstanceId: "phone:app_imessage", fieldId: "composer", fps: 30, startFrame, endFrame: startFrame + 90, text: "Hello", cadence: { framesPerGrapheme: 2, varianceFrames: 0 } });

it("uses the exit duration and lets a new session supersede the exiting keyboard", () => {
  const first = makeSession();
  expect(projectInputSession(first, 90, config).surface.progress).toBe(1);
  expect(projectInputSession(first, 97, config).surface.progress).toBe(0);
  const second = makeSession(92);
  expect(findInputSessionForProjection({ version: "1", sessions: [first, second] }, "phone", 93, 30)?.id).toBe(second.id);
});

it("paints sentence capitalization and correct alphabet/numeric controls", () => {
  const session = makeSession();
  const empty = projectInputSession(session, 1, config);
  expect(resolveInputKeyboardLayout(empty).rows[0][0]).toBe("Q");
  const complete = projectInputSession(session, 50, config);
  expect(resolveInputKeyboardLayout(complete).rows[0][0]).toBe("q");
  expect(complete.surface.theme.material.fill).toBe("#D1D3D9");
  expect(complete.surface.theme.colors.accentKeyText).toBe("#FFFFFF");
});

it("keeps long input projection indexed and independent of frame order", () => {
  const prepared = prepareInputSession({ deviceId: "phone", appInstanceId: "phone:app_imessage", fieldId: "composer", fps: 30, startFrame: 0, text: "hello ".repeat(400), cadence: { framesPerGrapheme: 1, varianceFrames: 0 } });
  let reads = 0;
  const session = { ...prepared, operations: new Proxy(prepared.operations, { get(target, key, receiver) { if (typeof key === "string" && /^\d+$/.test(key)) reads++; return Reflect.get(target, key, receiver); } }) };
  const expected = projectInputSession(session, 800, config);
  reads = 0;
  const started = performance.now();
  for (let index = 0; index < 200; index++) projectInputSession(session, (index * 37) % 2200, config);
  expect(projectInputSession(session, 800, config)).toEqual(expected);
  expect(reads).toBe(0); // Prepared operation indexes, not a full-session scan per frame.
  console.info(`Keyboard projection: 201 random seeks in ${(performance.now() - started).toFixed(1)}ms (2400 characters)`);
});
