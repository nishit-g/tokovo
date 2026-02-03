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

export class NotificationViewRegistryClass {
  private views = new Map<string, NotificationViewComponent>();

  register(appId: string, component: NotificationViewComponent): void {
    this.views.set(appId, component);
  }

  get(appId: string): NotificationViewComponent | undefined {
    return this.views.get(appId);
  }

  clear(): void {
    this.views.clear();
  }

  get size(): number {
    return this.views.size;
  }
}

export function createNotificationViewRegistry(): NotificationViewRegistryClass {
  return new NotificationViewRegistryClass();
}
