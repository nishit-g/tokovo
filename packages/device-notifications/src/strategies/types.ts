
import React from "react";
import { NotificationInstance } from "@tokovo/core";

export interface NotificationStrategyProps {
    notification: NotificationInstance;
    isExpanded?: boolean;
    style?: React.CSSProperties;
}

export type NotificationStrategyComponent = React.FC<NotificationStrategyProps>;
