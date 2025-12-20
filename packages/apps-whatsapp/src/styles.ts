
export const injectWhatsAppStyles = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('tokovo-whatsapp-styles')) return;

    const style = document.createElement('style');
    style.id = 'tokovo-whatsapp-styles';
    style.innerHTML = `
        :root {
            /* 
             * WhatsApp iOS Theme - "Tokovo Production Grade"
             * Based on iOS 17/18 specs
             */

            /* --- Brand Colors --- */
            --wa-color-primary: #007AFF;         /* iOS Blue */
            --wa-color-accent: #34C759;          /* iOS Green */
            --wa-color-destructive: #FF3B30;     /* iOS Red */

            /* --- Backgrounds --- */
            --wa-bg-primary: #FFFFFF;
            --wa-bg-secondary: #F2F2F7;          /* System Grouped Background */
            --wa-bg-tertiary: #FFFFFF;
            --wa-bg-header: #f4f1eb; /* Solid Beige */
            --wa-bg-input: #F2F2F7;
            
            /* --- Chat Background --- */
            --wa-bg-chat: #f4f1eb;               /* Classic Beige */
            --wa-doodle-opacity: 0.08;           /* Subtle doodle pattern */
            
            /* --- Bubbles --- */
            --wa-bubble-in-bg: #FFFFFF;
            --wa-bubble-out-bg: #E7FFDB;         /* Classic Green Hint */
            --wa-bubble-in-pressed: #F2F2F7;
            --wa-bubble-out-pressed: #D3EFC4;

            /* --- Text --- */
            --wa-text-primary: #000000;
            --wa-text-secondary: #8E8E93;
            --wa-text-tertiary: #C7C7CC;
            --wa-text-on-color: #FFFFFF;
            
            /* --- Separators --- */
            --wa-separator: rgba(60, 60, 67, 0.29); /* iOS Separator */
            --wa-separator-non-opaque: #C6C6C8;

            /* --- Status Bar --- */
            --wa-status-bar-height: 47px; /* Dynamic Island area */
            
            /* --- Dimensions & Spacing --- */
            --wa-header-height: 44px;
            --wa-input-height: 56px;
            --wa-corner-radius-l: 18px;    /* Bubble radius */
            --wa-corner-radius-m: 12px;
            --wa-corner-radius-s: 6px;

            /* --- Shadows --- */
            --wa-shadow-sm: 0 1px 2px rgba(0,0,0,0.05); /* Subtle bubble shadow */
        }

        /* DARK MODE - iOS Standard */
        [data-theme='dark'] {
            /* --- Brand Colors --- */
            --wa-color-primary: #0A84FF;
            --wa-color-accent: #30D158;
            --wa-color-destructive: #FF453A;

            /* --- Backgrounds --- */
            --wa-bg-primary: #000000;
            --wa-bg-secondary: #1C1C1E;
            --wa-bg-tertiary: #2C2C2E;
            --wa-bg-header: rgba(10, 10, 10, 0.94);
            --wa-bg-input: #1C1C1E;

            /* --- Chat Background --- */
            --wa-bg-chat: #0B141A;
            --wa-doodle-opacity: 0.06;

            /* --- Bubbles --- */
            --wa-bubble-in-bg: #1F2C34;          /* Dark Gray Blue */
            --wa-bubble-out-bg: #005C4B;         /* Dark Teal */
            --wa-bubble-in-pressed: #2A3942;
            --wa-bubble-out-pressed: #025043;

            /* --- Text --- */
            --wa-text-primary: #FFFFFF;
            --wa-text-secondary: #8E8E93;
            --wa-text-tertiary: #48484A;
            --wa-text-on-color: #FFFFFF;

            /* --- Separators --- */
            --wa-separator: rgba(84, 84, 88, 0.65);
            --wa-separator-non-opaque: #38383A;
            
            /* --- Shadows --- */
            --wa-shadow-sm: 0 1px 1px rgba(0,0,0,0.2); 
        }

        /* UTILITIES */
        .wa-ios-blur {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        
        .wa-ios-font {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
    `;
    document.head.appendChild(style);
};
