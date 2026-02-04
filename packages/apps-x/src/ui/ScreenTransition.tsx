import React from "react";
import { useTime } from "@tokovo/react";

interface ScreenTransitionProps {
  lastNavFrame?: number;
  children: React.ReactNode;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  lastNavFrame,
  children,
}) => {
  const t = useTime();
  const base = lastNavFrame ?? 0;
  const progress = Math.min(1, Math.max(0, (t - base) / 12));
  const eased = 1 - Math.pow(1 - progress, 3);

  return (
    <div
      style={{
        opacity: eased,
        transform: `translateY(${(1 - eased) * 10}px)`,
        transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
      }}
      className="x-fade-up"
    >
      {children}
    </div>
  );
};
