/**
 * Chat List Test Episode
 * 
 * Tests the updated chat list screen with various conversation states:
 * - Pinned chats
 * - Muted chats
 * - Unread messages
 * - Status indicators
 * - Group conversations
 * - Typing indicators
 * - Media message previews
 */

import { defineEpisode, episode } from "@tokovo/dsl";
import { FORMATS } from "../formats";

export default defineEpisode(
  episode("chat-list-showcase")
    .format(FORMATS.IPHONE_16_PRO)
    .fps(30)
    .device("Phone", "iphone-16-pro-max")
    .track((d) => 
      d
        // Setup multiple conversations with different states
        .app("app_whatsapp")
        .conversation("conv_bestie", {
          name: "Bestie ❤️",
          avatar: "https://randomuser.me/api/portraits/women/1.jpg",
          isPinned: true,
          hasStatus: true,
          messages: [
            { id: "1", from: "them", text: "omg did you see what happened?!", timestamp: "10:42 AM" },
          ],
        })
        .conversation("conv_work", {
          name: "Work Group 💼",
          type: "group",
          avatar: "https://randomuser.me/api/portraits/men/10.jpg",
          isMuted: true,
          unreadCount: 23,
          members: [
            { id: "boss", name: "Boss" },
            { id: "colleague", name: "Sarah" },
          ],
          messages: [
            { id: "1", from: "boss", senderName: "Boss", text: "Meeting at 3pm", timestamp: "9:30 AM" },
          ],
        })
        .conversation("conv_crush", {
          name: "Alex 💕",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg",
          hasStatus: true,
          messages: [
            { id: "1", from: "me", text: "Hey, are we still on for tonight?", timestamp: "Yesterday", readAt: true },
          ],
        })
        .conversation("conv_mom", {
          name: "Mom 👩",
          avatar: "https://randomuser.me/api/portraits/women/50.jpg",
          isPinned: true,
          unreadCount: 3,
          messages: [
            { id: "1", from: "them", text: "Call me when you get a chance sweetheart", timestamp: "8:15 AM" },
          ],
        })
        .conversation("conv_gym", {
          name: "Gym Bros 💪",
          type: "group",
          avatar: "https://randomuser.me/api/portraits/men/20.jpg",
          members: [
            { id: "mike", name: "Mike" },
            { id: "jake", name: "Jake" },
          ],
          messages: [
            { id: "1", from: "mike", senderName: "Mike", imageUrl: "photo.jpg", timestamp: "Yesterday" },
          ],
        })
        .conversation("conv_ex", {
          name: "Do Not Answer ⛔",
          avatar: "https://randomuser.me/api/portraits/women/30.jpg",
          isMuted: true,
          messages: [
            { id: "1", from: "them", text: "I miss you...", timestamp: "2 days ago" },
          ],
        })
        // Open the chat list screen
        .at(0)
        .openChatList()
        // Let it sit for viewing
        .wait(90) // 3 seconds at 30fps
    )
    .build(),
  {
    id: "chat-list-showcase",
    category: "tests",
    title: "Chat List Showcase",
    description: "Tests the updated chat list screen with pinned, muted, groups, and status indicators",
  }
);
