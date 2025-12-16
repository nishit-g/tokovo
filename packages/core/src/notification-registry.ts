
import React from 'react';
import { NotificationInstance } from "./types";

export interface NotificationViewProps {
    notification: NotificationInstance;
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
