import type { MutableHandlerRegistry } from "./registry.js";
import type {
  GroupMemberAddedEvent,
  GroupMemberRemovedEvent,
  GroupAdminChangedEvent,
  GroupInfoUpdatedEvent,
  ReactionAddedEvent,
} from "../schemas/index.js";
import type { WhatsAppMessage } from "../types/index.js";

function requireGroupConversation(
  conversation: { id: string; type?: "dm" | "group" },
  operation: string,
): void {
  if (conversation.type !== "group") {
    throw new Error(
      `Cannot ${operation}: WhatsApp conversation "${conversation.id}" is not a group`,
    );
  }
}

export function registerGroupHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<GroupMemberAddedEvent>("GROUP_MEMBER_ADDED", (ctx, e) => {
    requireGroupConversation(ctx.conversation, "add group member");
    const { memberId, memberName } = e.payload;
    if (ctx.conversation.members?.some((member) => member.id === memberId)) {
      throw new Error(
        `Cannot add group member: WhatsApp member "${memberId}" already exists in conversation "${ctx.conversation.id}"`,
      );
    }
    const addedBy = e.payload.addedBy === "me" ? "You" : e.payload.addedBy;
    const msg: WhatsAppMessage = {
      id: `sys_${e.at}_added_${memberId}`,
      from: "system",
      type: "system",
      systemType: "member_added",
      text: `${addedBy ?? "Someone"} added ${memberName}`,
      targetMember: memberName,
      actorName: addedBy,
      at: e.at,
    };
    ctx.addMessage(msg);

    if (!ctx.conversation.members) ctx.conversation.members = [];
    ctx.conversation.members.push({
      id: memberId,
      name: memberName,
    });
  });

  registry.registerHandler<GroupMemberRemovedEvent>(
    "GROUP_MEMBER_REMOVED",
    (ctx, e) => {
      requireGroupConversation(ctx.conversation, "remove group member");
      const { memberId, memberName } = e.payload;
      if (!ctx.conversation.members?.some((member) => member.id === memberId)) {
        throw new Error(
          `Cannot remove group member: WhatsApp member "${memberId}" does not exist in conversation "${ctx.conversation.id}"`,
        );
      }
      const removedBy =
        e.payload.removedBy === "me" ? "You" : e.payload.removedBy;
      const msg: WhatsAppMessage = {
        id: `sys_${e.at}_removed_${memberId}`,
        from: "system",
        type: "system",
        systemType: "member_removed",
        text: `${removedBy ?? "Someone"} removed ${memberName}`,
        targetMember: memberName,
        actorName: removedBy,
        at: e.at,
      };
      ctx.addMessage(msg);

      ctx.conversation.members = ctx.conversation.members.filter(
        (m) => m.id !== memberId,
      );
      ctx.conversation.admins = (ctx.conversation.admins ?? []).filter(
        (id) => id !== memberId,
      );
    },
  );

  registry.registerHandler<GroupAdminChangedEvent>(
    "GROUP_ADMIN_CHANGED",
    (ctx, e) => {
      requireGroupConversation(ctx.conversation, "change group admin");
      const { memberId, memberName, action, changedBy } = e.payload;
      if (!ctx.conversation.members?.some((member) => member.id === memberId)) {
        throw new Error(
          `Cannot change group admin: WhatsApp member "${memberId}" does not exist in conversation "${ctx.conversation.id}"`,
        );
      }
      ctx.conversation.admins ??= [];
      if (action === "promote") {
        if (!ctx.conversation.admins.includes(memberId)) {
          ctx.conversation.admins.push(memberId);
        }
      } else {
        ctx.conversation.admins = ctx.conversation.admins.filter(
          (id) => id !== memberId,
        );
      }
      const actor = changedBy === "me" ? "You" : changedBy;
      const target = memberName ?? memberId;
      ctx.addMessage({
        id: `sys_${e.at}_admin_${memberId}`,
        from: "system",
        type: "system",
        systemType: "admin_change",
        text:
          action === "promote"
            ? `${actor} made ${target} an admin`
            : `${actor} removed ${target} as admin`,
        targetMember: target,
        actorName: changedBy,
        at: e.at,
      });
    },
  );

  registry.registerHandler<GroupInfoUpdatedEvent>(
    "GROUP_INFO_UPDATED",
    (ctx, e) => {
      requireGroupConversation(ctx.conversation, "update group info");
      const { field, newValue, changedBy } = e.payload;
      if (field === "avatar") {
        ctx.conversation.avatar = newValue;
        return;
      }

      if (field === "description") {
        ctx.conversation.description = newValue;
        ctx.addMessage({
          id: `sys_${e.at}_description_changed`,
          from: "system",
          type: "system",
          systemType: "group_description_changed",
          text: `${changedBy === "me" ? "You" : changedBy} changed the group description`,
          actorName: changedBy,
          at: e.at,
        });
        return;
      }

      ctx.conversation.name = newValue;
      ctx.addMessage({
        id: `sys_${e.at}_name_changed`,
        from: "system",
        type: "system",
        systemType: "group_name_changed",
        text: `${changedBy === "me" ? "You" : changedBy} changed the group name to "${newValue}"`,
        actorName: changedBy,
        at: e.at,
      });
    },
  );
  registry.registerHandler<ReactionAddedEvent>("REACTION_ADDED", (ctx, e) => {
    const msg = ctx.requireMessageById(
      e.payload.messageId,
      "add reaction to message",
    );
    if (!msg.reactions) {
      msg.reactions = [];
    }

    const emoji = e.payload.emoji;
    const fromMe = e.payload.fromMe ?? false;

    const existing = msg.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      existing.count += 1;
      if (fromMe) existing.fromMe = true;
    } else {
      msg.reactions.push({
        emoji,
        count: 1,
        fromMe,
      });
    }
  });
}
