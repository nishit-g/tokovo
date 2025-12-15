export interface MessageData {
    id: string;
    text: string;
    from: string;
    timestamp?: string;
    status?: "sent" | "delivered" | "read";
    type?: "text" | "image" | "video" | "voice" | "system";
    // Add other fields as necessary from the legacy implementation
}

export interface WhatsAppState {
    conversationId?: string;
    // Add other state properties if needed for navigation
}
