/**
 * Device Builder
 * 
 * Fluent API for defining a device's story.
 * Manages conversation context and beat collection.
 */

import { DeviceScene, ConversationDef, Beat } from "@tokovo/ir";
import { BeatBuilder } from "./beat-builder";

/**
 * Beat callback function.
 */
export type BeatFn = (b: BeatBuilder) => void;

/**
 * Device builder collects conversations and beats for a device.
 */
export class DeviceBuilder {
    private readonly deviceId: string;
    private readonly profileId: string;
    private appId: string = "app_whatsapp"; // Default app
    private readonly conversations: ConversationDef[] = [];
    private readonly beats: Beat[] = [];
    private currentConversationId: string | undefined;

    constructor(deviceId: string, profileId: string = "iphone16") {
        this.deviceId = deviceId;
        this.profileId = profileId;
    }

    /**
     * Set the app for this device.
     */
    app(appId: string): this {
        this.appId = appId;
        return this;
    }

    /**
     * Define a conversation.
     * Also sets it as the current conversation for subsequent beats.
     */
    conversation(id: string, config?: { name?: string; avatar?: string; type?: "dm" | "group" }): this {
        const def: ConversationDef = {
            id,
            name: config?.name,
            avatar: config?.avatar,
            type: config?.type ?? "dm",
        };
        this.conversations.push(def);
        this.currentConversationId = id;
        return this;
    }

    /**
     * Define a beat (named group of actions).
     */
    beat(name: string, fn: BeatFn): this {
        if (!this.currentConversationId) {
            throw new Error(`beat("${name}") called but no conversation defined. Call conversation() first.`);
        }

        const builder = new BeatBuilder(
            this.deviceId,
            this.appId,
            this.currentConversationId
        );
        fn(builder);

        this.beats.push({
            name,
            ops: builder.getOps(),
        });

        return this;
    }

    /**
     * Build the device scene.
     */
    build(): DeviceScene {
        return {
            deviceId: this.deviceId,
            profileId: this.profileId,
            appId: this.appId,
            conversations: this.conversations,
            beats: this.beats,
        };
    }
}
