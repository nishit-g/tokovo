
export const injectWhatsAppStyles = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('tokovo-whatsapp-styles')) return;

    const style = document.createElement('style');
    style.id = 'tokovo-whatsapp-styles';
    style.innerHTML = `
        :root {
            /* WhatsApp Base Palette */
            --app-wa-primary: #007AFF;
            --app-wa-secondary: #8E8E93;
            --app-wa-background: #FFFFFF;
            --app-wa-header-bg: rgba(246, 246, 246, 0.9);
            --app-wa-chat-bg: #ECE5DD;
            
            /* Bubbles */
            --app-wa-bubble-my-bg: #DCF8C6;
            --app-wa-bubble-other-bg: #FFFFFF;
            --app-wa-bubble-text: #000000;
            --app-wa-bubble-time: rgba(0,0,0,0.45);
            --app-wa-separator: rgba(0,0,0,0.1);
        }

        [data-theme='dark'] {
             --app-wa-primary: #0A84FF;
             --app-wa-secondary: #98989D;
             --app-wa-background: #000000;
             --app-wa-header-bg: rgba(30, 30, 30, 0.9);
             --app-wa-chat-bg: #0b141a; /* WhatsApp Dark Chat Bg */
             
             --app-wa-bubble-my-bg: #005c4b;
             --app-wa-bubble-other-bg: #202c33;
             --app-wa-bubble-text: #e9edef;
             --app-wa-bubble-time: rgba(255,255,255,0.6);
             --app-wa-separator: rgba(255,255,255,0.1);
        }
    `;
    document.head.appendChild(style);
};
