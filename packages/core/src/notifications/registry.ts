import React from "react";

export interface NotificationViewNotification {
  id: string;
  appId: string;
  title: string;
  body: string;
  icon?: string;
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    destructive?: boolean;
  }>;
  category?: string;
  state: string;
}

export interface NotificationViewProps {
  notification: NotificationViewNotification;
  isExpanded: boolean;
  style?: React.CSSProperties;
}

export type NotificationViewComponent = React.FC<NotificationViewProps>;

export class NotificationViewRegistry {
  private static views: Record<string, NotificationViewComponent> = {};

  static register(appId: string, component: NotificationViewComponent) {
    this.views[appId] = component;
  }

  static get(appId: string): NotificationViewComponent | undefined {
    return this.views[appId];
  }
}
