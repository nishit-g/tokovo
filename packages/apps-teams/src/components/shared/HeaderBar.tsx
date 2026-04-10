import React from "react";
import {
  headerRowStyle,
  headerTitleWrapStyle,
  subtitleStyle,
  titleStyle,
} from "../../styles.js";

export const HeaderBar: React.FC<{
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}> = ({ title, subtitle, leading, trailing }) => (
  <div style={headerRowStyle}>
    {leading}
    <div style={headerTitleWrapStyle}>
      <div style={titleStyle}>{title}</div>
      {subtitle ? <div style={subtitleStyle}>{subtitle}</div> : null}
    </div>
    {trailing}
  </div>
);
