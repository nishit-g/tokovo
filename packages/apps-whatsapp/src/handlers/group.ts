import type { MutableHandlerRegistry } from "./registry";
import type {
  GroupMemberAddedEvent,
  GroupMemberRemovedEvent,
  DateSeparatorEvent,
  ReactEvent,
  ReactionAddedEvent,
} from "../schemas";
import type { WhatsAppMessage } from "../types";

export function registerGroupHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<GroupMemberAddedEvent>("GroupMemberAdded", (ctx, e) => {
    const addedBy = e.addedBy === "me" ? "You" : e.addedBy;
    const msg: WhatsAppMessage = {
      id: `sys_${e.at}_added_${e.memberId}`,
      from: "system",
      type: "system",
      systemType: "member_added",
      text: `${addedBy} added ${e.memberName}`,
      targetMember: e.memberName,
      actorName: addedBy,
      at: e.at,
    };
    ctx.addMessage(msg);

    if (!ctx.conversation.members) ctx.conversation.members = [];
    ctx.conversation.members.push({
      id: e.memberId,
      name: e.memberName,
    });
  });

  registry.registerHandler<GroupMemberRemovedEvent>(
    "GroupMemberRemoved",
    (ctx, e) => {
    const removedBy = e.removedBy === "me" ? "You" : e.removedBy;
    const msg: WhatsAppMessage = {
      id: `sys_${e.at}_removed_${e.memberId}`,
      from: "system",
      type: "system",
      systemType: "member_removed",
      text: `${removedBy} removed ${e.memberName}`,
      targetMember: e.memberName,
      actorName: removedBy,
      at: e.at,
    };
    ctx.addMessage(msg);

    if (ctx.conversation.members) {
      ctx.conversation.members = ctx.conversation.members.filter(
        (m) => m.id !== e.memberId,
      );
    }
  });

  registry.registerHandler<DateSeparatorEvent>("DateSeparator", (ctx, e) => {
    const payload = e.payload ?? {};
    const msg: WhatsAppMessage = {
      id: `sep_${e.at}_date`,
      from: "system",
      type: "system",
      systemType: "date_change",
      text: payload.text ?? "Today",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<ReactEvent>("React", (ctx, e) => {
    const payload = e.payload ?? {};
    const emoji = payload.emoji ?? "❤️";
    const messages = ctx.conversation.messages;

    let targetMsg: WhatsAppMessage | undefined;

    const messageId = payload.messageRef?.messageId ?? payload.messageRef?.id;
    if (messageId) {
      targetMsg = ctx.getMessageById(messageId);
    }

    const indexRef = payload.messageRef?.index;
    if (!targetMsg && indexRef !== undefined) {
      if (indexRef === "last" || indexRef === -1) {
        targetMsg = messages[messages.length - 1];
      } else if (typeof indexRef === "number" && indexRef < 0) {
        targetMsg = messages[messages.length + indexRef];
      } else if (typeof indexRef === "number") {
        targetMsg = messages[indexRef];
      }
    }

    if (!targetMsg && messages.length > 0) {
      targetMsg = messages[messages.length - 1];
    }

    if (targetMsg) {
      if (!targetMsg.reactions) {
        targetMsg.reactions = [];
      }

      const existing = targetMsg.reactions.find((r) => r.emoji === emoji);
      if (existing) {
        existing.count += 1;
      } else {
        targetMsg.reactions.push({
          emoji,
          count: 1,
          fromMe: true,
        });
      }
    }
  });

  registry.registerHandler<ReactionAddedEvent>("ReactionAdded", (ctx, e) => {
    const msg = ctx.getMessageById(e.messageId);
    if (msg) {
      if (!msg.reactions) {
        msg.reactions = [];
      }

      const emoji = e.emoji ?? "❤️";
      const fromMe = e.fromMe ?? false;

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
    }
  });
}
