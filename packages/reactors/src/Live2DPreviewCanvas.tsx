import React, { useEffect, useMemo, useRef, useState } from "react";
import { validateLive2DModelManifest } from "./live2d-diagnostics.js";
import type { ReactorCardState } from "./types.js";

type RuntimeStatus =
  | "idle"
  | "loading-core"
  | "loading-model"
  | "ready"
  | "fallback";

async function ensureCubismCore(scriptSrc: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Live2D preview runtime requires a browser environment");
  }

  const globalWindow = window as Window & {
    Live2DCubismCore?: unknown;
    __tokovoLive2DCorePromise?: Promise<void>;
  };

  if (globalWindow.Live2DCubismCore) {
    return;
  }

  if (globalWindow.__tokovoLive2DCorePromise) {
    return globalWindow.__tokovoLive2DCorePromise;
  }

  globalWindow.__tokovoLive2DCorePromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-tokovo-live2d-core=\"${scriptSrc}\"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error(`Failed to load Live2D core script: ${scriptSrc}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.dataset.tokovoLive2dCore = scriptSrc;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load Live2D core script: ${scriptSrc}`));
    document.head.appendChild(script);
  });

  return globalWindow.__tokovoLive2DCorePromise;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load model manifest: ${url} (HTTP ${response.status})`);
  }
  return response.json();
}

function fitModelToCanvas(model: any, container: HTMLElement): void {
  const width = container.clientWidth || 512;
  const height = container.clientHeight || 512;
  const bounds = typeof model.getLocalBounds === "function"
    ? model.getLocalBounds()
    : { width: 1000, height: 1000 };
  const scale = Math.min(
    (width * 0.82) / Math.max(bounds.width || 1, 1),
    (height * 0.82) / Math.max(bounds.height || 1, 1),
  );

  if (model.anchor?.set) {
    model.anchor.set(0.5, 0.5);
  }
  if (model.scale?.set) {
    model.scale.set(scale, scale);
  }
  model.x = width / 2;
  model.y = height / 2;
}

export interface Live2DPreviewCanvasProps {
  card: ReactorCardState;
  enabled: boolean;
}

export const Live2DPreviewCanvas: React.FC<Live2DPreviewCanvasProps> = ({
  card,
  enabled,
}) => {
  const avatar = card.avatar.kind === "live2d" ? card.avatar : null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const [status, setStatus] = useState<RuntimeStatus>(
    enabled ? "loading-core" : "fallback",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "loading-core":
        return "Loading Core";
      case "loading-model":
        return "Loading Model";
      case "ready":
        return "Live Runtime";
      case "fallback":
      default:
        return "Fallback";
    }
  }, [status]);

  useEffect(() => {
    if (!enabled || !avatar) {
      setStatus("fallback");
      return;
    }

    if (!canvasRef.current || !containerRef.current) {
      return;
    }

    let disposed = false;

    const boot = async () => {
      try {
        setErrorMessage(null);
        setStatus("loading-core");
        await ensureCubismCore(avatar.coreScriptSrc);
        if (disposed) {
          return;
        }

        setStatus("loading-model");
        const manifest = await fetchJson(avatar.modelJsonSrc);
        const manifestCheck = validateLive2DModelManifest(manifest);
        if (!manifestCheck.ok) {
          throw new Error(manifestCheck.reason);
        }

        const { PIXI, Live2DModel } = await import("./live2d-browser-runtime.js");

        if (disposed || !canvasRef.current || !containerRef.current) {
          return;
        }

        const app = new (PIXI as any).Application({
          view: canvasRef.current,
          autoStart: true,
          autoDensity: true,
          backgroundAlpha: 0,
          resizeTo: containerRef.current,
        });
        const model = await Live2DModel.from(avatar.modelJsonSrc, {
          autoInteract: false,
          autoUpdate: true,
        });

        if (disposed) {
          app.destroy(true, true);
          return;
        }

        app.stage.addChild(model);
        fitModelToCanvas(model, containerRef.current);
        appRef.current = app;
        modelRef.current = model;
        setStatus("ready");
      } catch (error) {
        if (disposed) {
          return;
        }
        setStatus("fallback");
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    void boot();

    return () => {
      disposed = true;
      const model = modelRef.current;
      const app = appRef.current;
      modelRef.current = null;
      appRef.current = null;
      try {
        if (model?.destroy) {
          model.destroy();
        }
        if (app?.destroy) {
          app.destroy(true, true);
        }
      } catch {
        // ignore cleanup errors in preview teardown
      }
    };
  }, [
    avatar,
    enabled,
  ]);

  useEffect(() => {
    if (!enabled || !avatar || status !== "ready") {
      return;
    }

    const model = modelRef.current;
    if (!model) {
      return;
    }

    if (avatar.expression && typeof model.expression === "function") {
      void model.expression(avatar.expression).catch(() => undefined);
    }

    if (avatar.motion && typeof model.motion === "function") {
      void model.motion(avatar.motion).catch(() => undefined);
    }
  }, [avatar?.expression, avatar?.motion, enabled, status]);

  useEffect(() => {
    if (!enabled || !avatar || status !== "ready") {
      return;
    }

    const model = modelRef.current;
    const coreModel = model?.internalModel?.coreModel;
    if (!coreModel) {
      return;
    }

    const setParameterValueById = coreModel.setParameterValueById?.bind(coreModel);
    if (!setParameterValueById) {
      return;
    }

    const eyeOpenValue = Math.max(0.02, 1 - avatar.runtimeState.blink);

    for (const paramId of avatar.parameterBindings.mouthOpenParamIds) {
      setParameterValueById(paramId, avatar.runtimeState.mouthOpen);
    }

    for (const paramId of avatar.parameterBindings.eyeOpenParamIds) {
      setParameterValueById(paramId, eyeOpenValue);
    }

    if (avatar.parameterBindings.angleXParamId) {
      setParameterValueById(avatar.parameterBindings.angleXParamId, avatar.runtimeState.swayX);
    }

    if (avatar.parameterBindings.angleYParamId) {
      setParameterValueById(avatar.parameterBindings.angleYParamId, avatar.runtimeState.bobY);
    }

    if (avatar.parameterBindings.bodyAngleXParamId) {
      setParameterValueById(
        avatar.parameterBindings.bodyAngleXParamId,
        avatar.runtimeState.swayX * 0.6,
      );
    }
  }, [avatar, enabled, status]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: status === "ready" ? 1 : 0,
          transition: "opacity 180ms ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          maxWidth: "78%",
          padding: "6px 10px",
          borderRadius: 12,
          background:
            status === "ready"
              ? "rgba(5, 150, 105, 0.82)"
              : "rgba(15,23,42,0.82)",
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          lineHeight: 1.25,
        }}
      >
        {statusLabel}
        {errorMessage ? `: ${errorMessage}` : ""}
      </div>
    </div>
  );
};
