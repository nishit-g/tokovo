import React, { useEffect, useMemo, useState } from "react";
import type {
  PngtuberFrameKey,
  ReactionEmotion,
} from "@tokovo/reactions";
import {
  buildReactorFrameState,
  getEmotionLabel,
  ReactorsLayer,
  renderLive2DAvatar,
  renderStaticAvatar,
  validateLive2DModelManifest,
  type PngtuberMouthShape,
  type ReactorCardOverride,
  type ReactorCardState,
  type ReactorVisualState,
} from "@tokovo/reactors";
import {
  buildLabReactionPlan,
  getLabAssetChecks,
  LAB_SCENARIOS,
  PNG_MOUTH_TRACK_PROFILES,
} from "./lib/lab-state.js";
import {
  buildPngtuberPresetRecord,
  DEFAULT_PNGTUBER_PRESETS,
  PNGTUBER_PRESET_STORAGE_KEY,
  sanitizePngtuberPresetRecord,
} from "./lib/pngtuber-presets.js";
import { buildWorkbenchCard } from "./lib/workstation.js";

type ScenarioId = keyof typeof LAB_SCENARIOS;
type ViewId = "live2d" | "pngtuber" | "tokovo" | "assets";
type ControlMode = "timeline" | "manual";
type InspectorActorId = "hero" | "guest";

interface RuntimeCheckResult {
  id: string;
  status: "pending" | "pass" | "fail";
  detail: string;
}

const STAGE_WIDTH = 1080;
const STAGE_HEIGHT = 1920;
const VIEW_ORDER: ViewId[] = ["live2d", "pngtuber", "tokovo", "assets"];
const MANUAL_STATES: ReactorVisualState[] = [
  "idle",
  "listening",
  "speaking",
  "shocked",
  "deadpan",
  "thinking",
];
const EMOTIONS: Array<ReactionEmotion | "none"> = [
  "none",
  "neutral",
  "happy",
  "shocked",
  "deadpan",
  "thinking",
  "laughing",
  "angry",
  "sad",
];

function useLabPlayback(durationInFrames: number) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const handle = window.setInterval(() => {
      setFrame((current) => (current + 1) % durationInFrames);
    }, 1000 / 30);
    return () => window.clearInterval(handle);
  }, [durationInFrames, playing]);

  return { frame, setFrame, playing, setPlaying };
}

function useRuntimeChecks(modelPath: string): RuntimeCheckResult[] {
  const [results, setResults] = useState<RuntimeCheckResult[]>(() =>
    getLabAssetChecks().map((check) => ({
      id: check.id,
      status: "pending",
      detail: "Waiting for verification",
    })),
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const nextResults: RuntimeCheckResult[] = [];
      for (const check of getLabAssetChecks()) {
        try {
          const response = await fetch(check.expectedPath);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          if (check.id === "live2d-model") {
            const manifest = await response.json();
            const validation = validateLive2DModelManifest(manifest);
            if (!validation.ok) throw new Error(validation.reason);
          } else if (check.id === "core-script") {
            const text = await response.text();
            if (!text.includes("Live2D Cubism Core")) {
              throw new Error("Unexpected script payload");
            }
          }

          nextResults.push({
            id: check.id,
            status: "pass",
            detail: check.description,
          });
        } catch (error) {
          nextResults.push({
            id: check.id,
            status: "fail",
            detail: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (!cancelled) {
        nextResults.push({
          id: "model-target",
          status: "pass",
          detail: `Active model target: ${modelPath}`,
        });
        setResults(nextResults);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [modelPath]);

  return results;
}

function Badge({ status }: { status: RuntimeCheckResult["status"] }) {
  return <span className={`lab-badge lab-badge--${status}`}>{status.toUpperCase()}</span>;
}

function getViewLabel(view: ViewId): string {
  switch (view) {
    case "live2d":
      return "Live2D";
    case "pngtuber":
      return "PNGTuber";
    case "tokovo":
      return "Tokovo";
    case "assets":
      return "Assets";
  }
}

function getActorLabel(actorId: InspectorActorId): string {
  return actorId === "hero" ? "Hero Reactor" : "Guest Reactor";
}

function WorkbenchCardViewport({
  card,
  enableLive2DPreviewRuntime,
}: {
  card: ReactorCardState;
  enableLive2DPreviewRuntime: boolean;
}) {
  return (
    <div className="workbench-card">
      <div className="workbench-card__topline">
        <span>{card.state.toUpperCase()}</span>
        {getEmotionLabel(card.emotion) ? <span>{getEmotionLabel(card.emotion)}</span> : null}
      </div>
      <div className="workbench-card__avatar">
        {card.avatar.kind === "live2d"
          ? renderLive2DAvatar(card, enableLive2DPreviewRuntime)
          : renderStaticAvatar(card)}
      </div>
      <div className="workbench-card__footer">
        <div>
          <h3>{card.displayName}</h3>
          <p>{card.avatar.kind === "live2d" ? "Live2D runtime inspection" : "PNGTuber state inspection"}</p>
        </div>
        <div className="workbench-card__chips">
          <span>{card.avatar.kind}</span>
          {card.avatar.kind === "live2d" && card.avatar.motion ? <span>{card.avatar.motion}</span> : null}
          {card.avatar.kind === "pngtuber" ? <span>{card.avatar.frameKey}</span> : null}
        </div>
      </div>
    </div>
  );
}

function AssetViewport() {
  const checks = getLabAssetChecks();
  return (
    <div className="asset-viewport">
      <div className="asset-viewport__hero">
        <img src="/live2d/haru/Haru.2048/texture_00.png" alt="Haru texture" />
      </div>
      <div className="asset-viewport__grid">
        {checks.map((check) => (
          <article key={check.id} className="asset-card">
            <strong>{check.label}</strong>
            <code>{check.expectedPath}</code>
            <p>{check.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="range-field">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <strong>{value.toFixed(step < 1 ? 2 : 0)}</strong>
      </div>
    </label>
  );
}

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("duo-crossfire");
  const [activeView, setActiveView] = useState<ViewId>("live2d");
  const [compareMode, setCompareMode] = useState(false);
  const [secondaryView, setSecondaryView] = useState<ViewId>("pngtuber");
  const [showCaptions, setShowCaptions] = useState(true);
  const [showChrome, setShowChrome] = useState(true);
  const [enableLive2DPreviewRuntime, setEnableLive2DPreviewRuntime] = useState(true);
  const [controlMode, setControlMode] = useState<ControlMode>("timeline");
  const [manualState, setManualState] = useState<ReactorVisualState>("speaking");
  const [manualEmotion, setManualEmotion] = useState<ReactionEmotion | "none">("shocked");
  const [inspectorActorId, setInspectorActorId] = useState<InspectorActorId>("hero");
  const [stageScale, setStageScale] = useState(0.52);
  const [manualMotion, setManualMotion] = useState("auto");
  const [manualExpression, setManualExpression] = useState("auto");
  const [manualScale, setManualScale] = useState(1);
  const [manualOffsetX, setManualOffsetX] = useState(0);
  const [manualOffsetY, setManualOffsetY] = useState(0);
  const [manualMotionProgress, setManualMotionProgress] = useState(0.28);
  const [manualMouthOpen, setManualMouthOpen] = useState(0.82);
  const [manualBlink, setManualBlink] = useState(0.08);
  const [manualFocusEnergy, setManualFocusEnergy] = useState(0.92);
  const [manualSwayX, setManualSwayX] = useState(0);
  const [manualBobY, setManualBobY] = useState(0);
  const [manualPngFrameKey, setManualPngFrameKey] = useState<PngtuberFrameKey>("speaking");
  const [manualPulseScale, setManualPulseScale] = useState(1.04);
  const [manualPngMouthShape, setManualPngMouthShape] = useState<"auto" | PngtuberMouthShape>("auto");
  const [manualPngMouthTrackProfileId, setManualPngMouthTrackProfileId] = useState("snappy");
  const [pngPresetRecord, setPngPresetRecord] = useState(() =>
    buildPngtuberPresetRecord(DEFAULT_PNGTUBER_PRESETS),
  );
  const [selectedPngPresetId, setSelectedPngPresetId] = useState("reactive-tight");
  const [pngPresetStatus, setPngPresetStatus] = useState<string | null>(null);

  const plan = useMemo(() => buildLabReactionPlan(scenarioId), [scenarioId]);
  const scenario = LAB_SCENARIOS[scenarioId];
  const { frame, setFrame, playing, setPlaying } = useLabPlayback(scenario.durationInFrames);
  const runtimeChecks = useRuntimeChecks("/live2d/haru/Haru.model3.json");
  const passingChecks = runtimeChecks.filter((check) => check.status === "pass").length;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persisted = window.localStorage.getItem(PNGTUBER_PRESET_STORAGE_KEY);
    if (!persisted) {
      return;
    }

    try {
      const parsed = JSON.parse(persisted) as unknown;
      const sanitized = sanitizePngtuberPresetRecord(parsed);
      setPngPresetRecord((current) => ({
        ...current,
        ...sanitized,
      }));
    } catch {
      // ignore malformed persisted presets and keep the built-in defaults
    }
  }, []);

  useEffect(() => {
    if (activeView === "live2d") {
      setInspectorActorId("hero");
    } else if (activeView === "pngtuber") {
      setInspectorActorId("guest");
    }
  }, [activeView]);

  const inspectorCastMember = plan.cast.find((member) => member.id === inspectorActorId);
  const inspectorAvatarConfig = inspectorCastMember?.visualProfile.avatar;

  const live2dConfig =
    inspectorAvatarConfig?.kind === "live2d" ? inspectorAvatarConfig : undefined;
  const pngtuberConfig =
    inspectorAvatarConfig?.kind === "pngtuber" ? inspectorAvatarConfig : undefined;

  const live2dMotionOptions = useMemo(() => {
    if (!live2dConfig) {
      return ["auto"];
    }
    return [
      "auto",
      ...Array.from(
        new Set(
          [live2dConfig.motions.idle, live2dConfig.motions.listening, live2dConfig.motions.speaking]
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    ];
  }, [live2dConfig]);

  const live2dExpressionOptions = useMemo(() => {
    if (!live2dConfig) {
      return ["auto"];
    }
    return [
      "auto",
      ...Array.from(
        new Set(
          Object.values(live2dConfig.expressions).filter(
            (value): value is string => Boolean(value),
          ),
        ),
      ),
    ];
  }, [live2dConfig]);

  const pngtuberFrameOptions = useMemo(() => {
    if (!pngtuberConfig) {
      return ["speaking"] as PngtuberFrameKey[];
    }
    return Object.keys(pngtuberConfig.frames) as PngtuberFrameKey[];
  }, [pngtuberConfig]);
  const pngMouthTrackProfileOptions = useMemo(() => PNG_MOUTH_TRACK_PROFILES, []);
  const selectedPngMouthTrackProfile = useMemo(
    () =>
      pngMouthTrackProfileOptions.find((profile) => profile.id === manualPngMouthTrackProfileId)
      ?? pngMouthTrackProfileOptions[0],
    [manualPngMouthTrackProfileId, pngMouthTrackProfileOptions],
  );
  const pngPresetOptions = useMemo(
    () => Object.values(pngPresetRecord).sort((left, right) => left.label.localeCompare(right.label)),
    [pngPresetRecord],
  );

  const cardOverrides = useMemo<Record<string, ReactorCardOverride> | undefined>(() => {
    if (controlMode !== "manual" || !inspectorCastMember || !inspectorAvatarConfig) {
      return undefined;
    }

    const override: ReactorCardOverride = {
      state: manualState,
      emotion: manualEmotion === "none" ? null : manualEmotion,
    };

    if (inspectorAvatarConfig.kind === "live2d") {
      override.avatar = {
        kind: "live2d",
        motion: manualMotion === "auto" ? undefined : manualMotion,
        expression: manualExpression === "auto" ? undefined : manualExpression,
        scale: manualScale,
        offsetX: manualOffsetX,
        offsetY: manualOffsetY,
        runtimeState: {
          motionProgress: manualMotionProgress,
          mouthOpen: manualMouthOpen,
          blink: manualBlink,
          focusEnergy: manualFocusEnergy,
          swayX: manualSwayX,
          bobY: manualBobY,
        },
      };
    } else if (inspectorAvatarConfig.kind === "pngtuber") {
      override.avatar = {
        kind: "pngtuber",
        frameKey: manualPngFrameKey,
        pulseScale: manualPulseScale,
        mouthTrackSrc: selectedPngMouthTrackProfile?.mouthTrackSrc,
        mouthShape: manualPngMouthShape === "auto" ? undefined : manualPngMouthShape,
      };
    }

    return {
      [inspectorActorId]: override,
    };
  }, [
    controlMode,
    inspectorActorId,
    inspectorAvatarConfig,
    inspectorCastMember,
    manualBlink,
    manualBobY,
    manualEmotion,
    manualExpression,
    manualFocusEnergy,
    manualMotion,
    manualMotionProgress,
    manualMouthOpen,
    manualOffsetX,
    manualOffsetY,
    manualPngFrameKey,
    manualPngMouthShape,
    selectedPngMouthTrackProfile,
    manualPulseScale,
    manualScale,
    manualState,
    manualSwayX,
  ]);

  const frameState = useMemo(
    () =>
      buildReactorFrameState(plan, frame, {
        showCaptions,
        showChrome,
        cardOverrides,
      }),
    [cardOverrides, frame, plan, showCaptions, showChrome],
  );

  const heroCard = useMemo(
    () =>
      buildWorkbenchCard({
        plan,
        actorId: "hero",
        frame,
        override: cardOverrides?.hero,
      }),
    [cardOverrides, frame, plan],
  );
  const guestCard = useMemo(
    () =>
      buildWorkbenchCard({
        plan,
        actorId: "guest",
        frame,
        override: cardOverrides?.guest,
      }),
    [cardOverrides, frame, plan],
  );

  const inspectedCard = inspectorActorId === "hero" ? heroCard : guestCard;
  const visibleViews = compareMode ? [activeView, secondaryView] : [activeView];

  const renderView = (view: ViewId) => {
    switch (view) {
      case "live2d":
        return (
          <WorkbenchCardViewport
            card={heroCard}
            enableLive2DPreviewRuntime={enableLive2DPreviewRuntime}
          />
        );
      case "pngtuber":
        return (
          <WorkbenchCardViewport
            card={guestCard}
            enableLive2DPreviewRuntime={enableLive2DPreviewRuntime}
          />
        );
      case "tokovo":
        return (
          <div
            className="tokovo-viewport"
            style={{
              width: Math.round(STAGE_WIDTH * stageScale),
              height: Math.round(STAGE_HEIGHT * stageScale),
            }}
          >
            <div
              className="tokovo-viewport__inner"
              style={{
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                transform: `scale(${stageScale})`,
              }}
            >
              <ReactorsLayer
                reactionPlan={plan}
                frame={frame}
                durationInFrames={scenario.durationInFrames}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                config={{
                  showCaptions,
                  showChrome,
                  showDebugTimeline: true,
                  enableLive2DPreviewRuntime,
                  cardOverrides,
                }}
              />
            </div>
          </div>
        );
      case "assets":
        return <AssetViewport />;
    }
  };

  const hasVisibleTokovoPane = visibleViews.includes("tokovo");

  const applySelectedPngPreset = () => {
    const preset = pngPresetRecord[selectedPngPresetId];
    if (!preset) {
      return;
    }

    setControlMode("manual");
    setInspectorActorId("guest");
    setManualPngFrameKey(preset.frameKey);
    setManualPulseScale(preset.pulseScale);
    setManualPngMouthShape(preset.mouthShape);
    setManualPngMouthTrackProfileId(preset.mouthTrackProfileId);
    setPngPresetStatus(`Loaded ${preset.label}.`);
  };

  const saveSelectedPngPreset = () => {
    const existing = pngPresetRecord[selectedPngPresetId];
    const nextRecord = {
      ...pngPresetRecord,
      [selectedPngPresetId]: {
        id: selectedPngPresetId,
        label: existing?.label ?? selectedPngPresetId,
        frameKey: manualPngFrameKey,
        pulseScale: Number(manualPulseScale.toFixed(2)),
        mouthShape: manualPngMouthShape,
        mouthTrackProfileId: manualPngMouthTrackProfileId,
      },
    };

    setPngPresetRecord(nextRecord);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PNGTUBER_PRESET_STORAGE_KEY, JSON.stringify(nextRecord));
    }
    setPngPresetStatus(`Saved ${nextRecord[selectedPngPresetId]?.label}.`);
  };

  const resetSelectedPngPreset = () => {
    const builtIn = DEFAULT_PNGTUBER_PRESETS.find((preset) => preset.id === selectedPngPresetId);
    if (!builtIn) {
      return;
    }

    const nextRecord = {
      ...pngPresetRecord,
      [selectedPngPresetId]: builtIn,
    };
    setPngPresetRecord(nextRecord);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PNGTUBER_PRESET_STORAGE_KEY, JSON.stringify(nextRecord));
    }
    setPngPresetStatus(`Reset ${builtIn.label}.`);
  };

  return (
    <div className="studio-shell">
      <aside className="studio-rail">
        <div className="panel-block">
          <p className="eyebrow">Tokovo Studio Lab</p>
          <h1>Avatar control room</h1>
          <p className="muted">
            Center viewport first. Controls on the sides. This is where the avatar
            runtime gets proven before Tokovo episodes inherit it.
          </p>
        </div>

        <div className="panel-block">
          <label className="field">
            <span>Scenario</span>
            <select
              value={scenarioId}
              onChange={(event) => {
                setScenarioId(event.target.value as ScenarioId);
                setFrame(0);
              }}
            >
              {Object.values(LAB_SCENARIOS).map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">{scenario.description}</p>
        </div>

        <div className="panel-block">
          <p className="eyebrow">Views</p>
          <div className="tab-column">
            {VIEW_ORDER.map((view) => (
              <button
                key={view}
                className={`tab-button ${activeView === view ? "tab-button--active" : ""}`}
                onClick={() => setActiveView(view)}
              >
                {getViewLabel(view)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-block">
          <p className="eyebrow">Run State</p>
          <div className="metric-row">
            <span>Playback</span>
            <button className="ghost-button" onClick={() => setPlaying((value) => !value)}>
              {playing ? "Pause" : "Play"}
            </button>
          </div>
          <div className="metric-row">
            <span>Checks</span>
            <strong>
              {passingChecks}/{runtimeChecks.length}
            </strong>
          </div>
          <div className="metric-row">
            <span>Active line</span>
            <strong>{frameState.activeSegment?.id ?? "none"}</strong>
          </div>
          <div className="metric-row">
            <span>Inspecting</span>
            <strong>{getActorLabel(inspectorActorId)}</strong>
          </div>
        </div>
      </aside>

      <main className="studio-main">
        <div className="viewport-toolbar">
          <div className="viewport-toolbar__tabs">
            {VIEW_ORDER.map((view) => (
              <button
                key={view}
                className={`toolbar-tab ${activeView === view ? "toolbar-tab--active" : ""}`}
                onClick={() => setActiveView(view)}
              >
                {getViewLabel(view)}
              </button>
            ))}
          </div>
          <div className="viewport-toolbar__actions">
            <label className="toggle-pill">
              <span>Compare</span>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(event) => setCompareMode(event.target.checked)}
              />
            </label>
            {compareMode ? (
              <select
                value={secondaryView}
                onChange={(event) => setSecondaryView(event.target.value as ViewId)}
              >
                {VIEW_ORDER.filter((view) => view !== activeView).map((view) => (
                  <option key={view} value={view}>
                    {getViewLabel(view)}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </div>

        <section className={`viewport-stage ${compareMode ? "viewport-stage--compare" : ""}`}>
          {visibleViews.map((view) => (
            <div key={`${view}-${compareMode ? "compare" : "single"}`} className="viewport-pane">
              <div className="viewport-pane__header">
                <strong>{getViewLabel(view)}</strong>
                <span>{view === "tokovo" ? "composition" : "inspector view"}</span>
              </div>
              <div className="viewport-pane__body">{renderView(view)}</div>
            </div>
          ))}
        </section>

        <section className="timeline-dock">
          <div className="timeline-dock__header">
            <strong>Timeline</strong>
            <span>
              frame {frame} / {scenario.durationInFrames - 1}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={scenario.durationInFrames - 1}
            value={frame}
            onChange={(event) => setFrame(Number(event.target.value))}
          />
          <div className="segment-track">
            {plan.segments.map((segment) => {
              const speaker = plan.cast.find((member) => member.id === segment.speakerId);
              return (
                <div
                  key={segment.id}
                  className="segment-chip"
                  style={{
                    left: `${(segment.startFrame / scenario.durationInFrames) * 100}%`,
                    width: `${Math.max(
                      3,
                      ((segment.endFrame - segment.startFrame) / scenario.durationInFrames) * 100,
                    )}%`,
                    background: speaker?.visualProfile.accentColor ?? "#94a3b8",
                    opacity: frame >= segment.startFrame && frame < segment.endFrame ? 1 : 0.55,
                  }}
                  title={`${segment.id}: ${segment.text}`}
                />
              );
            })}
            <div
              className="segment-track__cursor"
              style={{ left: `${(frame / scenario.durationInFrames) * 100}%` }}
            />
          </div>
          <div className="timeline-log">
            {plan.segments.map((segment) => (
              <div key={segment.id} className="timeline-log__row">
                <strong>{segment.id}</strong>
                <span>{segment.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className="studio-inspector">
        <div className="panel-block">
          <p className="eyebrow">Inspector</p>
          <h2>{getViewLabel(activeView)} Controls</h2>
          <p className="muted small">
            Direct actor control matters more than adding `xstate` right now. We need
            the viewport to be truthful first.
          </p>
        </div>

        <div className="panel-block">
          <div className="metric-row">
            <span>Live2D runtime</span>
            <button
              className="ghost-button"
              onClick={() => setEnableLive2DPreviewRuntime((value) => !value)}
            >
              {enableLive2DPreviewRuntime ? "Enabled" : "Fallback"}
            </button>
          </div>
          <div className="metric-row">
            <span>Captions</span>
            <button className="ghost-button" onClick={() => setShowCaptions((value) => !value)}>
              {showCaptions ? "Shown" : "Hidden"}
            </button>
          </div>
          <div className="metric-row">
            <span>Chrome</span>
            <button className="ghost-button" onClick={() => setShowChrome((value) => !value)}>
              {showChrome ? "Shown" : "Hidden"}
            </button>
          </div>
        </div>

        <div className="panel-block">
          <label className="field">
            <span>Inspector target</span>
            <select
              value={inspectorActorId}
              onChange={(event) => setInspectorActorId(event.target.value as InspectorActorId)}
            >
              <option value="hero">Hero Reactor</option>
              <option value="guest">Guest Reactor</option>
            </select>
          </label>
          <label className="field">
            <span>Control mode</span>
            <select
              value={controlMode}
              onChange={(event) => setControlMode(event.target.value as ControlMode)}
            >
              <option value="timeline">Timeline-driven</option>
              <option value="manual">Manual inspect</option>
            </select>
          </label>
          <label className="field">
            <span>Manual state</span>
            <select
              value={manualState}
              disabled={controlMode !== "manual"}
              onChange={(event) => setManualState(event.target.value as ReactorVisualState)}
            >
              {MANUAL_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Manual emotion</span>
            <select
              value={manualEmotion}
              disabled={controlMode !== "manual"}
              onChange={(event) => setManualEmotion(event.target.value as ReactionEmotion | "none")}
            >
              {EMOTIONS.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">
            {controlMode === "manual"
              ? "Manual overrides are applied through the shared reactor package and show up in Tokovo too."
              : "Timeline mode keeps the inspector live, but the viewport follows the scenario script."}
          </p>
        </div>

        {live2dConfig ? (
          <div className="panel-block">
            <p className="eyebrow">Live2D Runtime</p>
            <label className="field">
              <span>Motion</span>
              <select
                value={manualMotion}
                disabled={controlMode !== "manual"}
                onChange={(event) => setManualMotion(event.target.value)}
              >
                {live2dMotionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Expression</span>
              <select
                value={manualExpression}
                disabled={controlMode !== "manual"}
                onChange={(event) => setManualExpression(event.target.value)}
              >
                {live2dExpressionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="inspector-grid">
              <RangeField
                label="Scale"
                value={manualScale}
                min={0.7}
                max={1.4}
                step={0.01}
                disabled={controlMode !== "manual"}
                onChange={setManualScale}
              />
              <RangeField
                label="Motion Progress"
                value={manualMotionProgress}
                min={0}
                max={1}
                step={0.01}
                disabled={controlMode !== "manual"}
                onChange={setManualMotionProgress}
              />
              <RangeField
                label="Offset X"
                value={manualOffsetX}
                min={-80}
                max={80}
                step={1}
                disabled={controlMode !== "manual"}
                onChange={setManualOffsetX}
              />
              <RangeField
                label="Offset Y"
                value={manualOffsetY}
                min={-80}
                max={80}
                step={1}
                disabled={controlMode !== "manual"}
                onChange={setManualOffsetY}
              />
              <RangeField
                label="Mouth Open"
                value={manualMouthOpen}
                min={0}
                max={1}
                step={0.01}
                disabled={controlMode !== "manual"}
                onChange={setManualMouthOpen}
              />
              <RangeField
                label="Blink"
                value={manualBlink}
                min={0}
                max={1}
                step={0.01}
                disabled={controlMode !== "manual"}
                onChange={setManualBlink}
              />
              <RangeField
                label="Focus Energy"
                value={manualFocusEnergy}
                min={0}
                max={1}
                step={0.01}
                disabled={controlMode !== "manual"}
                onChange={setManualFocusEnergy}
              />
              <RangeField
                label="Sway X"
                value={manualSwayX}
                min={-12}
                max={12}
                step={0.5}
                disabled={controlMode !== "manual"}
                onChange={setManualSwayX}
              />
              <RangeField
                label="Bob Y"
                value={manualBobY}
                min={-12}
                max={12}
                step={0.5}
                disabled={controlMode !== "manual"}
                onChange={setManualBobY}
              />
            </div>
          </div>
        ) : null}

        {pngtuberConfig ? (
          <div className="panel-block">
            <p className="eyebrow">PNGTuber Runtime</p>
            <label className="field">
              <span>Preset Slot</span>
              <select
                value={selectedPngPresetId}
                onChange={(event) => setSelectedPngPresetId(event.target.value)}
              >
                {pngPresetOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <button className="ghost-button" onClick={applySelectedPngPreset}>
                Apply Preset
              </button>
              <button className="ghost-button" onClick={saveSelectedPngPreset}>
                Save Slot
              </button>
              <button className="ghost-button" onClick={resetSelectedPngPreset}>
                Reset Slot
              </button>
            </div>
            {pngPresetStatus ? <p className="muted small">{pngPresetStatus}</p> : null}
            <label className="field">
              <span>Mouth Track Profile</span>
              <select
                value={manualPngMouthTrackProfileId}
                disabled={controlMode !== "manual"}
                onChange={(event) => setManualPngMouthTrackProfileId(event.target.value)}
              >
                {pngMouthTrackProfileOptions.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted small">
              {selectedPngMouthTrackProfile?.description}
            </p>
            <label className="field">
              <span>Frame</span>
              <select
                value={manualPngFrameKey}
                disabled={controlMode !== "manual"}
                onChange={(event) => setManualPngFrameKey(event.target.value as PngtuberFrameKey)}
              >
                {pngtuberFrameOptions.map((frameKey) => (
                  <option key={frameKey} value={frameKey}>
                    {frameKey}
                  </option>
                ))}
              </select>
            </label>
            {pngtuberConfig.mode === "motion-video" ? (
              <label className="field">
                <span>Mouth Shape</span>
                <select
                  value={manualPngMouthShape}
                  disabled={controlMode !== "manual"}
                  onChange={(event) =>
                    setManualPngMouthShape(
                      event.target.value as "auto" | PngtuberMouthShape,
                    )
                  }
                >
                  {["auto", "closed", "half", "open", "e", "u"].map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <RangeField
              label="Pulse Scale"
              value={manualPulseScale}
              min={1}
              max={1.2}
              step={0.01}
              disabled={controlMode !== "manual"}
              onChange={setManualPulseScale}
            />
          </div>
        ) : null}

        {hasVisibleTokovoPane ? (
          <div className="panel-block">
            <p className="eyebrow">Tokovo Composition</p>
            <RangeField
              label="Tokovo Zoom"
              value={stageScale}
              min={0.32}
              max={0.8}
              step={0.01}
              onChange={setStageScale}
            />
          </div>
        ) : null}

        <div className="panel-block">
          <p className="eyebrow">Current Actor</p>
          <div className="check-card">
            <div className="check-card__header">
              <strong>{inspectedCard.displayName}</strong>
              <span>{inspectedCard.avatar.kind}</span>
            </div>
            <p className="muted small">
              State: {inspectedCard.state} | Emotion: {inspectedCard.emotion ?? "none"}
            </p>
            {inspectedCard.avatar.kind === "live2d" ? (
              <p className="muted small">
                Motion: {inspectedCard.avatar.motion ?? "auto"} | Expression:{" "}
                {inspectedCard.avatar.expression ?? "auto"}
              </p>
            ) : null}
            {inspectedCard.avatar.kind === "pngtuber" ? (
              <p className="muted small">
                Mode: {inspectedCard.avatar.mode} | Frame: {inspectedCard.avatar.frameKey} |
                Mouth: {inspectedCard.avatar.mouthShape} | Track:{" "}
                {selectedPngMouthTrackProfile?.label ?? "Default"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="panel-block">
          <p className="eyebrow">Runtime Checks</p>
          <div className="check-list">
            {runtimeChecks.map((check) => (
              <div key={check.id} className="check-card">
                <div className="check-card__header">
                  <strong>{check.id}</strong>
                  <Badge status={check.status} />
                </div>
                <p className="muted small">{check.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
