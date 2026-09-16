import { projectXMotion, xRouteShift } from "../runtime/motion.js";
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
    () =>
      resolveXExperience({
        platform,
        appearance,
        themeId: device.appTheme,
        locale: state.locale,
        reducedMotion: device.os.motion === "reduced",
        increasedContrast: device.os.contrast === "increased",
        textScale: device.os.textScale,
      }),
    [
      appearance,
      device.appTheme,
      device.os.contrast,
      device.os.motion,
      device.os.textScale,
      platform,
      state.locale,
    ],
  );
  const projected = projectXMotion(state, frame, experience.reducedMotion);
  const projectedWorld =
    projected === state
      ? world
      : { ...world, appInstances: { ...world.appInstances, [`${deviceId}:app_x`]: projected } };
  const transition = state.lastTransition;
  const duration = experience.motion.routeFrames;
  const progress =
    !transition || duration === 0
      ? 1
      : Math.min(1, Math.max(0, (frame - transition.atFrame) / duration));
  const eased = 1 - Math.pow(1 - progress, 3);
  const direction =
    (transition?.direction === "back" ? -1 : 1) * (experience.direction === "rtl" ? -1 : 1);
  const screenHeight = Math.max(
    0,
    height - appViewport.interactiveInsets.top - appViewport.interactiveInsets.bottom,
  );
  const outgoingWorld = transition
    ? {
        ...projectedWorld,
        appInstances: {
          ...projectedWorld.appInstances,
          [`${deviceId}:app_x`]: { ...projected, route: transition.from },
        },
      }
    : projectedWorld;

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
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          {transition && progress < 1 ? (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateX(${-direction * eased * width * 0.25}px)`,
                opacity: 1 - eased * 0.25,
              }}
            >
              {renderXScreen(transition.from, {
                world: outgoingWorld,
                deviceId,
                width,
                height: screenHeight,
              })}
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: experience.colors.background,
              transform: `translateX(${xRouteShift(state, frame, width, duration, experience.direction === "rtl")}px)`,
              boxShadow: progress < 1 ? "0 0 18px rgba(0,0,0,.15)" : undefined,
            }}
          >
            {renderXScreen(state.route, {
              world: projectedWorld,
              deviceId,
              width,
              height: screenHeight,
            })}
          </div>
        </div>
      </div>
    </XExperienceProvider>
  );
};

export const ui = { XView };
