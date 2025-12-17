/**
 * Scene Builder
 * 
 * Fluent API for defining cross-device scenes.
 * Used for coordinating actions across multiple devices.
 */

import { Beat, CrossDeviceScene } from "@tokovo/ir";
import { BeatBuilder } from "./beat-builder";
import { BeatFn } from "./device-builder";

/**
 * Device action within a scene.
 */
export interface SceneDeviceAction {
    deviceId: string;
    beats: Beat[];
}

/**
 * Scene builder for cross-device coordination.
 */
export class SceneBuilder {
    private readonly sceneName: string;
    private readonly deviceActions: SceneDeviceAction[] = [];

    constructor(sceneName: string) {
        this.sceneName = sceneName;
    }

    /**
     * Define actions for a specific device within this scene.
     */
    device(deviceId: string, fn: (d: SceneDeviceBuilder) => void): this {
        const builder = new SceneDeviceBuilder(deviceId);
        fn(builder);
        this.deviceActions.push({
            deviceId,
            beats: builder.getBeats(),
        });
        return this;
    }

    /**
     * Get the scene name.
     */
    getName(): string {
        return this.sceneName;
    }

    /**
     * Get device actions for this scene.
     */
    getDeviceActions(): SceneDeviceAction[] {
        return this.deviceActions;
    }

    /**
     * Build the CrossDeviceScene for IR output.
     */
    build(): CrossDeviceScene {
        const deviceBeats: Record<string, Beat[]> = {};
        for (const action of this.deviceActions) {
            deviceBeats[action.deviceId] = action.beats;
        }
        return {
            name: this.sceneName,
            deviceBeats,
        };
    }
}

/**
 * Minimal device builder for use within scenes.
 */
export class SceneDeviceBuilder {
    private readonly deviceId: string;
    private readonly beats: Beat[] = [];
    private appId: string = "app_whatsapp";
    private conversationId: string | undefined;

    constructor(deviceId: string) {
        this.deviceId = deviceId;
    }

    /**
     * Set conversation context.
     */
    conversation(id: string): this {
        this.conversationId = id;
        return this;
    }

    /**
     * Define a beat within this scene.
     */
    beat(name: string, fn: BeatFn): this {
        if (!this.conversationId) {
            throw new Error(`Scene beat "${name}" requires conversation context`);
        }

        const builder = new BeatBuilder(this.deviceId, this.appId, this.conversationId);
        fn(builder);

        this.beats.push({
            name,
            ops: builder.getOps(),
        });

        return this;
    }

    /**
     * Get collected beats.
     */
    getBeats(): Beat[] {
        return this.beats;
    }
}
