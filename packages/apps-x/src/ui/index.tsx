import React, { useMemo } from "react";
import { type PluginViewProps } from "@tokovo/core";
import { useTime } from "@tokovo/react";
import { XExperienceProvider } from "../experience/context.js";
import { resolveXExperience } from "../experience/resolver.js";
import { renderXScreen } from "../presentation/router.js";
import { requireXState } from "../runtime/selectors.js";

export const XView: React.FC<PluginViewProps> = ({
  world,
  deviceId,
  platform,
  width,
  height,
  appViewport,
}) => {
  const frame = useTime();
  const device = world.devices[deviceId];
  if (!device) throw new Error(`X_DEVICE_MISSING: "${deviceId}" is not in world state`);
  const state = requireXState(world, deviceId);
  const appearance = device.appAppearance ?? device.os.appearance;
  const experience = useMemo(
    () => resolveXExperience({
      platform,
      appearance,
      themeId: device.appTheme,
      locale: state.locale,
      reducedMotion: device.os.motion === "reduced",
      increasedContrast: device.os.contrast === "increased",
      textScale: device.os.textScale,
    }),
    [appearance, device.appTheme, device.os.contrast, device.os.motion, device.os.textScale, platform, state.locale],
  );
  const transition = state.lastTransition;
  const duration = experience.motion.routeFrames;
  const progress = !transition || duration === 0
    ? 1
    : Math.min(1, Math.max(0, (frame - transition.atFrame) / duration));
  const eased = 1 - Math.pow(1 - progress, 3);
  const direction = transition?.direction === "back" ? -1 : 1;

  return (
    <XExperienceProvider experience={experience}>
      <div
        role="application"
        aria-label={experience.t("appName")}
        lang={experience.locale}
        dir={experience.direction}
        data-x-platform={experience.platform}
        data-x-appearance={experience.appearance}
        data-x-theme={experience.themeId}
        style={{
          width: "100%",
          height: "100%",
          paddingTop: appViewport.interactiveInsets.top,
          paddingBottom: appViewport.interactiveInsets.bottom,
          boxSizing: "border-box",
          overflow: "hidden",
          background: experience.colors.background,
          color: experience.colors.text,
          fontFamily: experience.type.family,
          textRendering: "geometricPrecision",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            // Runtime state contains only the active route, so fading from zero
            // would reveal the app background rather than the outgoing screen.
            // Keep every authored frame readable and use position for the cue.
            transform: `translateX(${direction * (1 - eased) * 10}px)`,
            overflow: "hidden",
          }}
        >
          {renderXScreen(state.route, {
            world,
            deviceId,
            width,
            height: Math.max(0, height - appViewport.interactiveInsets.top - appViewport.interactiveInsets.bottom),
          })}
        </div>
      </div>
    </XExperienceProvider>
  );
};

export const ui = { XView };
