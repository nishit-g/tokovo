import { useMemo } from "react";
import { MessageData } from "../types/index.js";

export interface MessageGroup {
    id: string;
    senderId: string;
    isMe: boolean;
    messages: {
        data: MessageData;
        isFirst: boolean;
        isLast: boolean;
    }[];
}

const GROUP_TIME_THRESHOLD_SECONDS = 60;

export const useMessageGrouping = (messages: MessageData[], ownerName: string = "me"): MessageGroup[] => {
    return useMemo(() => {
        const groups: MessageGroup[] = [];
        const normalizedOwnerName = ownerName.trim().toLowerCase();

        let currentGroup: MessageGroup | null = null;

        messages.forEach((msg) => {
            const isSystem = msg.type === "system" || msg.type === "screenshot_alert";
            const normalizedFrom = msg.from.trim().toLowerCase();
            const isMe =
              normalizedFrom === "me" ||
              (normalizedOwnerName.length > 0 && normalizedFrom === normalizedOwnerName);
            const senderId = isMe ? "me" : msg.from;

            // System messages always break groups and sit alone
            if (isSystem) {
                currentGroup = null; // Break current group
                groups.push({
                    id: `group_${msg.id}`,
                    senderId: "system",
                    isMe: false, // System is never 'me'
                    messages: [{ data: msg, isFirst: true, isLast: true }]
                });
                return;
            }

            // Check if we can continue the current group
            // Rules: Same Sender AND Time Gap is small
            let shouldGroup = false;

            if (currentGroup && currentGroup.senderId === senderId && currentGroup.senderId !== "system") {
                const lastMsg = currentGroup.messages[currentGroup.messages.length - 1].data;

                // Check time frame if available
                if (msg.at !== undefined && lastMsg.at !== undefined) {
                    const diffFrames = msg.at - lastMsg.at;
                    // standard 30fps
                    const diffSeconds = diffFrames / 30;
                    if (diffSeconds < GROUP_TIME_THRESHOLD_SECONDS) {
                        shouldGroup = true;
                    }
                } else {
                    // Fallback to simpler logic if no 'at' (e.g. legacy mocks)
                    // If no explicit time, assume grouped
                    shouldGroup = true;
                }
            }

            if (shouldGroup && currentGroup) {
                currentGroup.messages.push({
                    data: msg,
                    isFirst: false,
                    isLast: true // Will be fixed in next iteration or end of loop
                });
                // Fix previous message's isLast
                currentGroup.messages[currentGroup.messages.length - 2].isLast = false;
            } else {
                // Start new group
                currentGroup = {
                    id: `group_${msg.id}`,
                    senderId,
                    isMe,
                    messages: [{
                        data: msg,
                        isFirst: true,
                        isLast: true
                    }]
                };
                groups.push(currentGroup);
            }
        });

        return groups;
    }, [messages, ownerName]);
};
