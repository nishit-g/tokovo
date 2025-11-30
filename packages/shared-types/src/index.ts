export type Message = {
    id: string;
    sender: string;
    atSecond: number;
    text: string;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'audio';
};

export type Conversation = {
    chatTitle: string;
    avatarAssetId: string;
    wallpaperAssetId?: string;
    messages: Message[];
};

export type TypingIndicator = {
    sender: string;
    fromSecond: number;
    toSecond: number;
};

export type WhatsAppData = {
    conversation: Conversation;
    typingIndicators: TypingIndicator[];
};

export type App = {
    id: string;
    type: 'whatsapp'; // Extendable for other apps
    data: WhatsAppData;
};

export type Device = {
    id: string;
    os: 'ios' | 'android';
    model: string;
    time: string;
    carrier: string;
    batteryPercent: number;
    theme: 'light' | 'dark';
    apps: App[];
    activeAppId: string;
};

export type Character = {
    id: string;
    name: string;
    device: Device;
};

export type Episode = {
    episodeId: string;
    fps: number;
    durationSeconds: number;
    characters: Character[];
};
