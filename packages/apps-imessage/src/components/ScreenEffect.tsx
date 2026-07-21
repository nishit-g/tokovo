/** Frame-driven full-screen iMessage effects. */

import React from "react";
import {
  clamp01,
  easeOutCubic,
  frameProgress,
  loopProgress,
  pulse,
  useFps,
  useTime,
} from "@tokovo/react";

export type ScreenEffectType =
  | "balloons"
  | "confetti"
  | "lasers"
  | "fireworks"
  | "celebration"
  | "echo"
  | "spotlight"
  | "love";

interface ScreenEffectProps {
  effect: ScreenEffectType;
  startFrame: number;
}

interface EffectFrameProps {
  elapsedFrame: number;
  fps: number;
}

const EFFECT_DURATION_SECONDS: Record<ScreenEffectType, number> = {
  balloons: 4,
  confetti: 3.5,
  lasers: 3,
  fireworks: 4,
  celebration: 4,
  echo: 2,
  spotlight: 3,
  love: 3.5,
};

export const ScreenEffect: React.FC<ScreenEffectProps> = ({ effect, startFrame }) => {
  const frame = useTime();
  const fps = useFps();
  const elapsedFrame = frame - startFrame;

  if (elapsedFrame < 0 || elapsedFrame >= EFFECT_DURATION_SECONDS[effect] * fps) {
    return null;
  }

  const content = (() => {
    switch (effect) {
      case "balloons":
        return <BalloonsEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "confetti":
        return <ConfettiEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "lasers":
        return <LasersEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "fireworks":
        return <FireworksEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "celebration":
        return <CelebrationEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "echo":
        return <EchoEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "spotlight":
        return <SpotlightEffect elapsedFrame={elapsedFrame} fps={fps} />;
      case "love":
        return <LoveEffect elapsedFrame={elapsedFrame} fps={fps} />;
    }
  })();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {content}
    </div>
  );
};

function deterministicUnit(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

const BalloonsEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF69B4"];
  return (
    <>
      {Array.from({ length: 15 }, (_, i) => {
        const delaySeconds = deterministicUnit(i, 2) * 1.5;
        const progress = easeOutCubic(frameProgress(elapsedFrame, delaySeconds * fps, 4 * fps));
        const size = 40 + deterministicUnit(i, 3) * 30;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: -100,
              left: `${5 + deterministicUnit(i, 1) * 90}%`,
              width: size,
              height: size * 1.2,
              backgroundColor: color,
              borderRadius: "50%",
              opacity: 1 - progress * 0.2,
              transform: `translateY(${-1000 * progress}px) rotate(${10 * progress}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `10px solid ${color}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -50,
                left: "50%",
                width: 1,
                height: 40,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            />
          </div>
        );
      })}
    </>
  );
};

const ConfettiEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#FF69B4", "#9B59B6"];
  return (
    <>
      {Array.from({ length: 60 }, (_, i) => {
        const delaySeconds = deterministicUnit(i, 5) * 2;
        const progress = easeOutCubic(frameProgress(elapsedFrame, delaySeconds * fps, 3.5 * fps));
        const rotation = deterministicUnit(i, 6) * 360;
        const size = 8 + deterministicUnit(i, 7) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -20,
              left: `${deterministicUnit(i, 4) * 100}%`,
              width: size,
              height: size * 0.6,
              backgroundColor: colors[i % colors.length],
              opacity: 1 - progress,
              transform: `translateY(${950 * progress}px) rotate(${rotation + 720 * progress}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

const LasersEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => (
  <>
    {Array.from({ length: 8 }, (_, i) => {
      const progress = loopProgress(elapsedFrame, fps, 0.8, i * 0.15);
      const opacity = Math.sin(progress * Math.PI);
      const color = i % 2 === 0 ? "#FF0000" : "#00FF00";
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${10 + i * 12}%`,
            left: 0,
            width: "100%",
            height: 3,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
            opacity,
            transform: `translateX(${-100 + progress * 200}%)`,
          }}
        />
      );
    })}
  </>
);

const FireworksEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => {
  const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF69B4", "#9B59B6"];
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const raw = (elapsedFrame - i * 0.4 * fps) / (1.5 * fps);
        const progress = clamp01(raw);
        const scale = progress < 0.5 ? progress * 6 : 3 + (progress - 0.5) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${15 + (i % 3) * 35}%`,
              top: `${20 + Math.floor(i / 3) * 40}%`,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: colors[i],
              boxShadow: `0 0 30px 15px ${colors[i]}`,
              opacity: raw < 0 ? 0 : 1 - Math.max(0, progress - 0.5) * 2,
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </>
  );
};

const CelebrationEffect: React.FC<EffectFrameProps> = (props) => (
  <>
    <ConfettiEffect {...props} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
        opacity: 0.3 + pulse(props.elapsedFrame, props.fps, 1) * 0.3,
      }}
    />
  </>
);

const EchoEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {Array.from({ length: 5 }, (_, i) => {
      const progress = loopProgress(elapsedFrame, fps, 2, i * 0.2);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "3px solid rgba(0, 122, 255, 0.5)",
            opacity: 1 - progress,
            transform: `scale(${1 + progress * 7})`,
          }}
        />
      );
    })}
  </div>
);

const SpotlightEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => {
  const progress = frameProgress(elapsedFrame, 0, 3 * fps);
  const centerY = progress < 0.5 ? 100 - progress * 140 : 30 + (progress - 0.5) * 40;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% ${centerY}%, transparent 0%, rgba(0,0,0,0.8) 60%)`,
      }}
    />
  );
};

const LoveEffect: React.FC<EffectFrameProps> = ({ elapsedFrame, fps }) => (
  <>
    {Array.from({ length: 20 }, (_, i) => {
      const delaySeconds = deterministicUnit(i, 9) * 2;
      const raw = (elapsedFrame - delaySeconds * fps) / (3.5 * fps);
      const progress = clamp01(raw);
      const opacity = raw < 0 ? 0 : Math.min(1, progress * 10) * (1 - progress);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: -50,
            left: `${deterministicUnit(i, 8) * 100}%`,
            fontSize: 15 + deterministicUnit(i, 10) * 20,
            opacity,
            transform: `translateY(${-950 * progress}px) scale(${0.5 + progress * 0.7})`,
          }}
        >
          ❤️
        </div>
      );
    })}
  </>
);

export default ScreenEffect;
