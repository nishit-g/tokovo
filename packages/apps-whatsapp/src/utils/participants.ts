import type {
  ReplyToData,
  WhatsAppConversation,
  WhatsAppGroupMember,
} from "../types/index.js";

const LOCAL_ACTOR_IDS = new Set(["me", "you", "self"]);
const REMOTE_ALIAS_IDS = new Set(["them", "other", "remote"]);

function normalizeActorKey(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

function findMemberByActor(
  conversation: WhatsAppConversation | undefined,
  actor: string | undefined,
): WhatsAppGroupMember | undefined {
  const normalizedActor = normalizeActorKey(actor);
  if (!conversation || !normalizedActor) return undefined;

  return conversation.members?.find((member) => {
    const memberId = normalizeActorKey(member.id);
    const memberName = normalizeActorKey(member.name);
    return memberId === normalizedActor || memberName === normalizedActor;
  });
}

function findRemoteMember(
  conversation: WhatsAppConversation | undefined,
): WhatsAppGroupMember | undefined {
  return conversation?.members?.find((member) => {
    const memberId = normalizeActorKey(member.id);
    const memberName = normalizeActorKey(member.name);
    return !LOCAL_ACTOR_IDS.has(memberId ?? "") && !LOCAL_ACTOR_IDS.has(memberName ?? "");
  });
}

export function resolveParticipantName(
  conversation: WhatsAppConversation | undefined,
  actor: string | undefined,
): string | undefined {
  const normalizedActor = normalizeActorKey(actor);
  if (!normalizedActor) return actor;

  if (LOCAL_ACTOR_IDS.has(normalizedActor)) {
    return "You";
  }

  const member = findMemberByActor(conversation, actor);
  if (member?.name) {
    return member.name;
  }

  if (REMOTE_ALIAS_IDS.has(normalizedActor)) {
    if (conversation?.type === "dm") {
      return (
        conversation.name ??
        findRemoteMember(conversation)?.name ??
        "Someone"
      );
    }

    return findRemoteMember(conversation)?.name ?? "Someone";
  }

  if (conversation?.type === "dm") {
    return conversation?.name ?? actor;
  }

  return actor;
}

export function resolveTypingMembers(
  conversation: WhatsAppConversation | undefined,
): Array<{ id: string; name: string }> {
  const typing = conversation?.typing ?? {};
  const seen = new Set<string>();

  return Object.entries(typing).flatMap(([actor, isTyping]) => {
    if (!isTyping) return [];

    const normalizedActor = normalizeActorKey(actor);
    if (!normalizedActor || LOCAL_ACTOR_IDS.has(normalizedActor)) {
      return [];
    }

    const member = findMemberByActor(conversation, actor);
    const name = resolveParticipantName(conversation, actor);
    if (!name) return [];

    const dedupeKey = member?.id ?? name.toLowerCase();
    if (seen.has(dedupeKey)) {
      return [];
    }
    seen.add(dedupeKey);

    return [{ id: member?.id ?? actor, name }];
  });
}

export function resolveReplyPreview(
  conversation: WhatsAppConversation | undefined,
  replyTo: ReplyToData | undefined,
): ReplyToData | undefined {
  if (!replyTo) return undefined;
  return {
    ...replyTo,
    from: resolveParticipantName(conversation, replyTo.from) ?? replyTo.from,
  };
}
