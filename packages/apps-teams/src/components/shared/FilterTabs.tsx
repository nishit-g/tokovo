import React from "react";
import { chipRowStyle, chipStyle } from "../../styles.js";

export const FilterTabs: React.FC<{
  active: string;
  items: Array<{ id: string; label: string; badge?: number }>;
}> = ({ active, items }) => (
  <div className="tokovo-teams-scrollbar" style={chipRowStyle}>
    {items.map((item) => (
      <div key={item.id} style={chipStyle(item.id === active)}>
        {item.label}
        {item.badge && item.badge > 0 ? ` ${item.badge}` : ""}
      </div>
    ))}
  </div>
);
