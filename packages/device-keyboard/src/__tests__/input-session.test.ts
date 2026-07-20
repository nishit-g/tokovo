import { describe, expect, it } from "vitest";
import {
  applyPreparedInputOperation,
  createInputRuntimeState,
  evaluateInputSession,
  findInputSessionForField,
  getInputDisplayDraft,
  normalizeInputLocale,
  prepareInputProgram,
  prepareInputSession,
  projectInputSession,
  resolveInputExperience,
  type InputSessionIntent,
} from "../index.js";

function intent(
  overrides: Partial<InputSessionIntent> = {},
): InputSessionIntent {
  const hasTextOverride = Object.prototype.hasOwnProperty.call(overrides, "text");
  const text = hasTextOverride ? overrides.text : "hello";
  const expectedFinalValue = Object.prototype.hasOwnProperty.call(
    overrides,
    "expectedFinalValue",
  )
    ? overrides.expectedFinalValue
    : overrides.script
      ? undefined
      : text;
  return {
    deviceId: "phone",
    appInstanceId: "phone:app_whatsapp",
    fieldId: "conversation:launch:composer",
    fps: 30,
    startFrame: 0,
    submitAtFrame: 500,
    endFrame: 510,
    text,
    expectedFinalValue,
    seed: 42,
    ...overrides,
  };
}

describe("canonical multilingual input sessions", () => {
  it("prepares identical operation timelines for the same seed", () => {
    const first = prepareInputSession(intent({ text: "deterministic input" }));
    const second = prepareInputSession(intent({ text: "deterministic input" }));
    expect(first).toEqual(second);
  });

  it("allows seeded cadence variation without changing the final draft", () => {
    const first = prepareInputSession(
      intent({ text: "a reasonably long sentence", seed: "one" }),
    );
    const second = prepareInputSession(
      intent({ text: "a reasonably long sentence", seed: "two" }),
    );

    expect(first.operations.map((operation) => operation.at)).not.toEqual(
      second.operations.map((operation) => operation.at),
    );
    expect(evaluateInputSession(first, 500).submittedValue).toBe(
      "a reasonably long sentence",
    );
    expect(evaluateInputSession(second, 500).submittedValue).toBe(
      "a reasonably long sentence",
    );
  });

  it.each([
    ["en-US", "Hello world 👋🏽"],
    ["hi-IN", "नमस्ते दुनिया"],
    ["bn-BD", "হ্যালো বিশ্ব"],
    ["ar-EG", "مرحبًا بالعالم"],
    ["ja-JP", "こんにちは世界"],
    ["ko-KR", "안녕하세요 세계"],
    ["zh-Hans-CN", "你好，世界"],
    ["en-US", "👨‍👩‍👧‍👦 👍🏽 e\u0301"],
  ])("preserves grapheme-complete text for %s", (locale, text) => {
    const session = prepareInputSession(
      intent({
        locale,
        text,
        expectedFinalValue: text,
        submitAtFrame: 1_000,
        endFrame: 1_010,
      }),
    );
    const state = evaluateInputSession(session, session.submitAtFrame ?? 0);
    expect(state.submittedValue).toBe(text);
    expect(state.draft).toBe(text);
  });

  it("uses locale and first-strong text to resolve bidi direction", () => {
    const arabic = prepareInputSession(
      intent({
        locale: "ar-EG",
        text: "مرحبًا",
        expectedFinalValue: "مرحبًا",
      }),
    );
    const englishInsideArabicKeyboard = prepareInputSession(
      intent({
        locale: "ar-EG",
        text: "hello",
        expectedFinalValue: "hello",
      }),
    );
    const config = {
      fps: 30,
      viewportWidth: 1_290,
      viewportHeight: 2_796,
      keyboardHeight: 900,
    };

    expect(projectInputSession(arabic, 100, config).direction).toBe("rtl");
    expect(
      projectInputSession(englishInsideArabicKeyboard, 100, config).direction,
    ).toBe("ltr");
  });

  it.each([
    ["ios", "light", "system:ios:light", "ios-system-keyboard"],
    ["ios", "dark", "system:ios:dark", "ios-system-keyboard"],
    ["android", "light", "system:android:light", "android-system-keyboard"],
    ["android", "dark", "system:android:dark", "android-system-keyboard"],
  ] as const)(
    "resolves %s %s as a complete deterministic keyboard experience",
    (platform, appearance, themeId, presentationId) => {
      const experience = resolveInputExperience({
        platform,
        appearance,
        locale: "ar-EG",
      });
      expect(experience.theme.id).toBe(themeId);
      expect(experience.presentation.id).toBe(presentationId);
      expect(experience.locale.direction).toBe("rtl");
      expect(experience.capabilities).toEqual({
        supportsDarkMode: true,
        supportsBidi: true,
        supportsImeComposition: true,
        supportsGraphemeEditing: true,
      });
    },
  );

  it("models IME composition updates without prematurely mutating the draft", () => {
    const session = prepareInputSession(
      intent({
        text: undefined,
        locale: "ja-JP",
        script: [
          {
            type: "compose",
            updates: ["k", "ka", "か"],
            commit: "か",
            intervalFrames: 2,
            keys: ["k", "a", "ime"],
          },
        ],
        expectedFinalValue: "か",
      }),
    );
    const updates = session.operations.filter(
      (operation) => operation.type === "compositionUpdate",
    );
    const secondUpdate = updates[1];
    expect(secondUpdate).toBeDefined();

    const composing = evaluateInputSession(session, secondUpdate?.at ?? 0);
    expect(composing.draft).toBe("");
    expect(composing.composition?.text).toBe("ka");
    expect(getInputDisplayDraft(composing, session.keyboard.locale.tag)).toBe(
      "ka",
    );

    const committed = evaluateInputSession(session, 500);
    expect(committed.submittedValue).toBe("か");
  });

  it("supports deterministic mistakes, deletion, correction, and submission", () => {
    const session = prepareInputSession(
      intent({
        text: undefined,
        script: [
          { type: "type", text: "I’ll fox" },
          { type: "pause", frames: 8 },
          { type: "deleteBackward", count: 3, intervalFrames: 2 },
          { type: "type", text: "fix it now." },
        ],
        expectedFinalValue: "I’ll fix it now.",
      }),
    );

    expect(evaluateInputSession(session, 500).submittedValue).toBe(
      "I’ll fix it now.",
    );
  });

  it("uses logical grapheme selection for emoji-safe replacement", () => {
    const session = prepareInputSession(
      intent({
        initialValue: "👍🏽abc",
        text: undefined,
        script: [
          {
            type: "replaceRange",
            range: { anchor: 0, focus: 1 },
            text: "✅",
          },
        ],
        expectedFinalValue: "✅abc",
      }),
    );
    expect(evaluateInputSession(session, 500).submittedValue).toBe("✅abc");
  });

  it("evaluates direct random access identically to sequential application", () => {
    const session = prepareInputSession(
      intent({
        text: undefined,
        script: [
          { type: "type", text: "hello 🌍" },
          { type: "deleteBackward", count: 1 },
          { type: "type", text: "🌎" },
        ],
        expectedFinalValue: "hello 🌎",
      }),
    );
    let sequential = createInputRuntimeState(session);
    let operationIndex = 0;
    const ordered = [...session.operations].sort(
      (left, right) => left.at - right.at || left.sequence - right.sequence,
    );
    const sequentialByFrame = new Map<number, typeof sequential>();

    for (let frame = 0; frame <= session.endFrame; frame++) {
      while (ordered[operationIndex]?.at === frame) {
        sequential = applyPreparedInputOperation(
          sequential,
          ordered[operationIndex],
          session.keyboard.locale.tag,
        );
        operationIndex++;
      }
      sequentialByFrame.set(frame, sequential);
    }

    for (let frame = session.endFrame; frame >= 0; frame--) {
      expect(evaluateInputSession(session, frame)).toEqual(
        sequentialByFrame.get(frame),
      );
    }
  });

  it("projects viewport inset, stable anchors, and active keys without history", () => {
    const session = prepareInputSession(intent({ text: "a" }));
    const insert = session.operations.find(
      (operation) => operation.type === "insert",
    );
    expect(insert).toBeDefined();
    const config = {
      fps: 30,
      viewportWidth: 1_290,
      viewportHeight: 2_796,
      keyboardHeight: 900,
      transitionDurationFrames: 8,
    };

    const projection = projectInputSession(session, insert?.at ?? 0, config);
    expect(projection.surface.activeKey).toBe("a");
    expect(projection.surface.progress).toBe(1);
    expect(projection.surface.anchor).toEqual({
      x: 0,
      y: 1_896,
      width: 1_290,
      height: 900,
    });

    const reverseFirst = projectInputSession(session, 300, config);
    const earlierAfterReverse = projectInputSession(
      session,
      insert?.at ?? 0,
      config,
    );
    expect(earlierAfterReverse).toEqual(projection);
    expect(reverseFirst.displayDraft).toBe("a");
  });

  it("rejects impossible timing instead of truncating or silently skipping input", () => {
    expect(() =>
      prepareInputSession(
        intent({
          text: "this cannot fit",
          submitAtFrame: 2,
          endFrame: 3,
        }),
      ),
    ).toThrow("INPUT_TIMING_OVERFLOW");
  });

  it("rejects invalid locale tags with an actionable diagnostic", () => {
    expect(() => normalizeInputLocale("not_a_locale!"))
      .toThrow("INPUT_INVALID_LOCALE");
  });

  it("allows sessions on separate devices and rejects overlap on one device", () => {
    const first = intent({
      id: "phone-a",
      deviceId: "phone-a",
      appInstanceId: "phone-a:app_whatsapp",
      startFrame: 0,
      submitAtFrame: 100,
      endFrame: 110,
    });
    const secondDevice = intent({
      id: "phone-b",
      deviceId: "phone-b",
      appInstanceId: "phone-b:app_whatsapp",
      startFrame: 0,
      submitAtFrame: 100,
      endFrame: 110,
    });
    const program = prepareInputProgram([first, secondDevice]);
    expect(program.sessions).toHaveLength(2);
    expect(
      findInputSessionForField(
        program,
        "phone-b:app_whatsapp",
        "conversation:launch:composer",
        50,
      )?.deviceId,
    ).toBe("phone-b");

    expect(() =>
      prepareInputProgram([
        first,
        intent({
          id: "overlap",
          deviceId: "phone-a",
          appInstanceId: "phone-a:app_linkedin",
          startFrame: 50,
          submitAtFrame: 150,
          endFrame: 160,
        }),
      ]),
    ).toThrow("INPUT_SESSION_CONFLICT");
  });
});
