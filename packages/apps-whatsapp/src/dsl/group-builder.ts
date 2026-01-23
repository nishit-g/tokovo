/**
 * WhatsApp Group DSL Builder
 *
 * Fluent API for group operations in DSL scripts.
 * Uses CustomOp pattern with WhatsApp-namespaced event types.
 *
 * Usage in DSL:
 * ```typescript
 * const group = new GroupBuilder("family_chat", () => cursor, pushOp);
 * group
 *   .addMember({ id: "alice", name: "Alice" })
 *   .addMember({ id: "bob", name: "Bob" }, "alice");
 * ```
 */

import {
  GROUP_EVENT_TYPES,
  GroupMemberDef,
  GroupMemberAddPayload,
  GroupMemberRemovePayload,
  GroupAdminChangePayload,
  GroupInfoUpdatePayload,
} from "../ir/group-ops";

interface CustomOp {
  at: number;
  kind: "Custom";
  deviceId: string;
  appId: string;
  eventType: string;
  payload: unknown;
}

export interface GroupBuilderOptions {
  deviceId?: string;
  appId?: string;
}

export class GroupBuilder {
  private readonly conversationId: string;
  private readonly getFrame: () => number;
  private readonly pushOp: (op: CustomOp) => void;
  private readonly deviceId: string;
  private readonly appId: string;

  constructor(
    conversationId: string,
    getFrame: () => number,
    pushOp: (op: CustomOp) => void,
    options: GroupBuilderOptions = {},
  ) {
    this.conversationId = conversationId;
    this.getFrame = getFrame;
    this.pushOp = pushOp;
    this.deviceId = options.deviceId || "primary";
    this.appId = options.appId || "app_whatsapp";
  }

  /**
   * Add a member to the group.
   * Generates a system message: "{addedBy} added {member.name}"
   *
   * @param member - Member to add (id, name, optional avatar)
   * @param addedBy - Who added them (default: "me")
   */
  addMember(member: GroupMemberDef, addedBy = "me"): this {
    const payload: GroupMemberAddPayload = {
      conversationId: this.conversationId,
      member,
      addedBy,
    };

    this.pushOp({
      at: this.getFrame(),
      kind: "Custom",
      deviceId: this.deviceId,
      appId: this.appId,
      eventType: GROUP_EVENT_TYPES.MEMBER_ADDED,
      payload,
    });

    return this;
  }

  /**
   * Remove a member from the group.
   * Generates a system message: "{removedBy} removed {memberName}"
   *
   * @param memberId - ID of member to remove
   * @param memberName - Display name for system message
   * @param removedBy - Who removed them (default: "me")
   */
  removeMember(memberId: string, memberName: string, removedBy = "me"): this {
    const payload: GroupMemberRemovePayload = {
      conversationId: this.conversationId,
      memberId,
      memberName,
      removedBy,
    };

    this.pushOp({
      at: this.getFrame(),
      kind: "Custom",
      deviceId: this.deviceId,
      appId: this.appId,
      eventType: GROUP_EVENT_TYPES.MEMBER_REMOVED,
      payload,
    });

    return this;
  }

  /**
   * Leave the group (shorthand for removing yourself).
   * Generates a system message: "You left the group"
   */
  leave(): this {
    return this.removeMember("me", "You", "me");
  }

  /**
   * Promote or demote a member's admin status.
   *
   * @param memberId - ID of member to change
   * @param action - "promote" or "demote"
   * @param changedBy - Who made the change (default: "me")
   */
  changeAdmin(
    memberId: string,
    action: "promote" | "demote",
    changedBy = "me",
  ): this {
    const payload: GroupAdminChangePayload = {
      conversationId: this.conversationId,
      memberId,
      action,
      changedBy,
    };

    this.pushOp({
      at: this.getFrame(),
      kind: "Custom",
      deviceId: this.deviceId,
      appId: this.appId,
      eventType: GROUP_EVENT_TYPES.ADMIN_CHANGED,
      payload,
    });

    return this;
  }

  /**
   * Make a member an admin.
   * Shorthand for changeAdmin(memberId, "promote").
   */
  makeAdmin(memberId: string, changedBy = "me"): this {
    return this.changeAdmin(memberId, "promote", changedBy);
  }

  /**
   * Remove admin status from a member.
   * Shorthand for changeAdmin(memberId, "demote").
   */
  removeAdmin(memberId: string, changedBy = "me"): this {
    return this.changeAdmin(memberId, "demote", changedBy);
  }

  /**
   * Update group info (name, avatar, description).
   *
   * @param field - Which field to update
   * @param newValue - New value for the field
   * @param changedBy - Who made the change (default: "me")
   */
  updateInfo(
    field: "name" | "avatar" | "description",
    newValue: string,
    changedBy = "me",
  ): this {
    const payload: GroupInfoUpdatePayload = {
      conversationId: this.conversationId,
      field,
      newValue,
      changedBy,
    };

    this.pushOp({
      at: this.getFrame(),
      kind: "Custom",
      deviceId: this.deviceId,
      appId: this.appId,
      eventType: GROUP_EVENT_TYPES.INFO_UPDATED,
      payload,
    });

    return this;
  }

  /**
   * Rename the group.
   * Shorthand for updateInfo("name", newName).
   */
  rename(newName: string, changedBy = "me"): this {
    return this.updateInfo("name", newName, changedBy);
  }
}

export function createGroupBuilder(
  conversationId: string,
  getFrame: () => number,
  pushOp: (op: CustomOp) => void,
  options?: GroupBuilderOptions,
): GroupBuilder {
  return new GroupBuilder(conversationId, getFrame, pushOp, options);
}
