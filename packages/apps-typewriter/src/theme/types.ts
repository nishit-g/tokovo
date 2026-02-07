export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export type TypewriterThemePresetId = "classic" | "midnight" | "sage";

export type WrapMode = "word" | "char" | "none";

export interface TypewriterLayoutTokens {
  maxCols: number;
  maxRows: number;
  wrap: WrapMode;
  bellColsFromRight: number;
}

export interface TypewriterThemeTokens {
  designWidth: number;
  designHeight: number;

  layout: TypewriterLayoutTokens;

  desk: {
    baseColor: string;
    vignetteOpacity: number;
    highlightOpacity: number;
    grainOpacity: number;
  };

  paper: {
    widthPct: number;
    heightPct: number;
    maxWidthPx: number;
    topPct: number;
    rotationDeg: number;
    borderRadiusPx: number;
    shadowBlurPx: number;
    shadowOpacity: number;
    grainOpacity: number;
    fiberOpacity: number;
    vignetteOpacity: number;
    bgTop: string;
    bgBottom: string;
  };

  text: {
    marginXPct: number;
    headerTopPadPx: number;
    headerBottomPadPx: number;
    headerGapPx: number;

    metaFontFamily: string;
    metaFontSizePx: number;
    metaLineHeightPx: number;
    metaLabelWidthPx: number;
    metaLabelColor: string;
    metaValueColor: string;
    metaDividerColor: string;

    fontFamily: string;
    fontSizePx: number;
    lineHeightPx: number;
    charWidthPx: number;
    letterSpacingPx: number;

    inkColor: string;
    inkOpacity: number;
    inkBleedOpacity: number;
    inkBleedBlurPx: number;
  };

  typewriter: {
    wrapHeightPct: number;
    wrapWidthPct: number;
    bodyRadiusPx: number;
    bodyTopPadPx: number;
    bodySidePadPx: number;
    bodyBgTop: string;
    bodyBgBottom: string;
    bodyOutline: string;
    bodyShadowOpacity: number;

    plateHeightPx: number;
    plateRadiusPx: number;

    keys: {
      gapPx: number;
      keyRadiusPx: number;
      keyFontSizePx: number;
      keyBgUpTop: string;
      keyBgUpBottom: string;
      keyBgDownTop: string;
      keyBgDownBottom: string;
      keyOutline: string;
      keyShadowOpacity: number;
      legendColor: string;
      legendSecondaryColor: string;
    };

    carriage: {
      trackHeightPx: number;
      trackRadiusPx: number;
      knobRadiusPx: number;
      knobColor: string;
      knobShadowOpacity: number;
      carriageColor: string;
    };
  };

  motion: {
    keyPressFrames: number;
    carriageReturnFrames: number;
    paperFeedFrames: number;
    deskShakePx: number;
    deskShakeDeg: number;
    idleSwayDeg: number;
  };

  audio: {
    baseKeyVol: number;
    baseSpaceVol: number;
    basePunctVol: number;
    baseBackspaceVol: number;
    baseCarriageVol: number;
    baseBellVol: number;
    roomVol: number;
    volVar: number;
    roomDurationFrames: number;
  };
}

export interface TypewriterThemeConfig {
  preset?: TypewriterThemePresetId;
  overrides?: DeepPartial<TypewriterThemeTokens>;
}
