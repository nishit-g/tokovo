/**
 * WhatsApp UI Configuration Tokens
 *
 * @description Platform-specific styling constants for WhatsApp UI.
 * Moved from @tokovo/core to apps-whatsapp for proper decoupling.
 */

export const whatsappConfig = {
    ios: {
        // Header
        headerHeight: 270,
        headerBg: "#F6F6F6",
        statusBarHeight: 144,
        avatarSize: 111,
        avatarMargin: 24,
        headerTitleSize: 51,
        headerSubtitleSize: 36,
        headerIconGap: 54,

        // Chat area
        chatBackground: "#ECE5DD",
        inputHeight: 180,

        // Message bubbles
        bubblePadding: 24,
        bubblePaddingHorizontal: 36,
        bubbleRadius: 24,
        bubbleTailRadius: 6,
        bubbleMaxWidth: "78%",
        bubbleMarginHorizontal: 36,
        bubbleGap: 12,
        bubbleShadow: "0 1px 0.5px rgba(0,0,0,0.13)",

        // Bubble colors
        bubbleMyColor: "#E7FFDB",
        bubbleOtherColor: "#FFFFFF",
        bubbleTextColor: "#111B21",

        // Message text
        messageTextSize: 48,
        messageLineHeight: 66,
        timestampSize: 33,
        timestampColor: "#667781",

        // Sender name (groups)
        senderNameSize: 33,
        senderNameColor: "#25D366",

        // Read receipts
        accentColor: "#25D366",
        readReceiptColor: "#53BDEB",
        unreadReceiptColor: "#8696A0",

        // Avatar (for contacts without photos)
        avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        avatarFontSize: 45,

        // Input area
        inputBg: "#FFFFFF",
        inputBorderRadius: 60,
        inputPlaceholderColor: "#8E8E93",
        inputTextColor: "#000000",
        inputIconColor: "#8E8E93",
        sendButtonColor: "#25D366",

        // Typing indicator
        typingBubbleColor: "#FFFFFF",
        typingDotColor: "#8E8E93",
        typingDotSize: 24,

        // Psychotic Features
        editedLabelColor: "#8E8E93",
        editedLabelSize: 30,
        missedCallIconColor: "#FF3B30",
        missedCallBubbleColor: "#FFFFFF",
        adminBadgeColor: "#E1DAD0",
        adminTextColor: "#667781",
        waveformActiveColor: "#007AFF",
        waveformInactiveColor: "#C7C7CC",
        screenshotAlertBg: "rgba(255,59,48,0.1)",
        screenshotAlertText: "#FF3B30",
    },
    android: {
        // Header
        headerHeight: 255,
        headerBg: "#008069",
        statusBarHeight: 120,
        avatarSize: 105,
        avatarMargin: 24,
        headerTitleSize: 48,
        headerSubtitleSize: 33,
        headerIconGap: 48,

        // Chat area
        chatBackground: "#ECE5DD",
        inputHeight: 165,

        // Message bubbles
        bubblePadding: 21,
        bubblePaddingHorizontal: 33,
        bubbleRadius: 21,
        bubbleTailRadius: 6,
        bubbleMaxWidth: "78%",
        bubbleMarginHorizontal: 30,
        bubbleGap: 9,
        bubbleShadow: "0 1px 1px rgba(0,0,0,0.1)",

        // Bubble colors
        bubbleMyColor: "#E7FFDB",
        bubbleOtherColor: "#FFFFFF",
        bubbleTextColor: "#111B21",

        // Message text
        messageTextSize: 45,
        messageLineHeight: 63,
        timestampSize: 30,
        timestampColor: "#667781",

        // Sender name (groups)
        senderNameSize: 30,
        senderNameColor: "#25D366",

        // Read receipts
        accentColor: "#25D366",
        readReceiptColor: "#53BDEB",
        unreadReceiptColor: "#8696A0",

        // Avatar (for contacts without photos)
        avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        avatarFontSize: 42,

        // Input area
        inputBg: "#FFFFFF",
        inputBorderRadius: 60,
        inputPlaceholderColor: "#8E8E93",
        inputTextColor: "#000000",
        inputIconColor: "#8E8E93",
        sendButtonColor: "#008069",

        // Typing indicator
        typingBubbleColor: "#FFFFFF",
        typingDotColor: "#8E8E93",
        typingDotSize: 21,

        // Psychotic Features
        editedLabelColor: "#8E8E93",
        editedLabelSize: 27,
        missedCallIconColor: "#FF3B30",
        missedCallBubbleColor: "#FFFFFF",
        adminBadgeColor: "#E1DAD0",
        adminTextColor: "#54656F",
        waveformActiveColor: "#008069",
        waveformInactiveColor: "#C7C7CC",
        screenshotAlertBg: "rgba(255,59,48,0.1)",
        screenshotAlertText: "#FF3B30",
    },
};

// Type export for platforms
export type WhatsAppPlatformConfig = typeof whatsappConfig.ios;
