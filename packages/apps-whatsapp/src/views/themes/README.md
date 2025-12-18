# WhatsApp Custom Themes

This directory is for custom UI themes (e.g., Ghibli style).

## Creating a New Theme

1. Create a new directory: `themes/ghibli/`

2. Create the strategy file: `themes/ghibli/strategy.ts`

```typescript
import { UIStrategy, UIStrategyRegistry } from "../../strategy";
// ... import your custom components

export const ghibliStrategy: UIStrategy = {
    id: "whatsapp-ghibli",
    name: "Ghibli Style",
    platform: "custom",
    
    Header: GhibliHeader,
    MessageBubble: GhibliMessageBubble,
    TypingIndicator: GhibliTypingIndicator,
    InputArea: GhibliInputArea,
    
    tokens: {
        backgroundColor: "#F5E6D3",
        bubbleMyBg: "#C8E6C9",
        bubbleOtherBg: "#FFF8E1",
        textColor: "#3E2723",
        secondaryColor: "#795548",
        accentColor: "#4CAF50",
        fontFamily: "'Kosugi Maru', sans-serif",
    },
};

UIStrategyRegistry.register(ghibliStrategy);
```

3. Create themed components in `themes/ghibli/components/`

4. Register the theme in your app initialization.

## Using a Theme

```typescript
import { UIStrategyRegistry } from "@tokovo/apps-whatsapp/views/strategy";

const strategy = UIStrategyRegistry.get("whatsapp-ghibli");
```
