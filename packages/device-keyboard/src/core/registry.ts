import React from "react";
import { KeyboardState } from "@tokovo/core";

export interface KeyboardProps {
    keyboard: KeyboardState;
    variant: "light" | "dark";
    t: number;
}

export type KeyboardComponent = React.ComponentType<KeyboardProps>;

class KeyboardRegistryClass {
    private implementations = new Map<string, KeyboardComponent>();

    register(id: string, component: KeyboardComponent) {
        this.implementations.set(id, component);
    }

    get(id: string): KeyboardComponent | undefined {
        return this.implementations.get(id);
    }
}

export const KeyboardRegistry = new KeyboardRegistryClass();
