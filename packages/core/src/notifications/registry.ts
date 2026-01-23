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

const notificationViews: Record<string, NotificationViewComponent> = {};

export const NotificationViewRegistry = {
  register(appId: string, component: NotificationViewComponent) {
    notificationViews[appId] = component;
  },

  get(appId: string): NotificationViewComponent | undefined {
    return notificationViews[appId];
  },
};
