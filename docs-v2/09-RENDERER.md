# Renderer

> React components for rendering Tokovo world state

---

## Overview

The Tokovo renderer converts WorldState to visual output:

- **Device frames** - Phone mockups with notch, buttons
- **App views** - Plugin-provided UI components
- **Overlays** - Notifications, keyboard, touch indicators
- **Camera** - CSS transforms for cinematic effects

---

## Core Components

### TokovoRenderer

The main entry point:

```tsx
import { TokovoRenderer } from "@tokovo/renderer";

const MyVideo = () => {
    const frame = useCurrentFrame();
    const world = runEpisode(compiled, frame);
    
    return <TokovoRenderer world={world} />;
};
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `world` | WorldState | Current world state |
| `plugins` | TokovoPlugin[] | Registered plugins |
| `deviceId` | string | Which device to render |

---

## Component Hierarchy

```
TokovoRenderer
├── CameraWrapper           // Camera transforms
│   └── DeviceFrame        // Phone mockup
│       ├── StatusBar      // Time, battery, signal
│       ├── AppContainer   // Plugin AppRoot
│       │   └── WhatsAppApp (example)
│       │       ├── Header
│       │       └── ChatView
│       ├── NotificationLayer
│       ├── KeyboardLayer
│       └── TouchLayer
├── AudioLayer             // Sound effects
└── DebugOverlay          // Development tools
```

---

## Device Frame

Renders the phone mockup:

```tsx
const DeviceFrame = ({ world, deviceId }) => {
    const device = world.devices[deviceId];
    
    return (
        <div className={`device device-${device.model}`}>
            <StatusBar 
                time={device.os.clock}
                battery={device.os.battery}
                network={device.os.network}
            />
            
            <AppContainer world={world} deviceId={deviceId} />
            
            <NotificationLayer 
                notifications={device.notifications}
            />
            
            <KeyboardLayer 
                keyboard={device.keyboard}
            />
        </div>
    );
};
```

---

## Camera Wrapper

Applies camera transforms:

```tsx
const CameraWrapper = ({ world, children }) => {
    const { transform } = world.camera;
    
    const style = {
        transform: `
            scale(${transform.scale})
            translate(${transform.translateX}px, ${transform.translateY}px)
            rotate(${transform.rotation}deg)
        `,
        transformOrigin: `${transform.originX * 100}% ${transform.originY * 100}%`,
        transition: transform.duration 
            ? `transform ${transform.duration}ms ${transform.easing}`
            : undefined
    };
    
    return <div style={style}>{children}</div>;
};
```

---

## App Container

Routes to plugin views:

```tsx
const AppContainer = ({ world, deviceId, plugins }) => {
    const device = world.devices[deviceId];
    const appId = device.foregroundAppId;
    
    // Find plugin for this app
    const plugin = plugins.find(p => p.id === appId);
    
    if (!plugin) {
        return <div>Unknown app: {appId}</div>;
    }
    
    const { AppRoot } = plugin.views;
    
    return <AppRoot world={world} deviceId={deviceId} />;
};
```

---

## Notification Layer

Renders notification banners:

```tsx
const NotificationLayer = ({ notifications }) => {
    return (
        <div className="notification-layer">
            {notifications.map(notif => (
                <NotificationBanner
                    key={notif.id}
                    notification={notif}
                />
            ))}
        </div>
    );
};
```

---

## Audio Layer

Uses Remotion's `<Audio>` for sound:

```tsx
const AudioLayer = ({ world }) => {
    return (
        <>
            {world.audio.activeSounds.map(sound => (
                <Audio
                    key={sound.instanceId}
                    src={sound.src}
                    volume={sound.volume}
                    startFrom={sound.startFrame}
                />
            ))}
        </>
    );
};
```

---

## Touch Layer

Visualizes touch points:

```tsx
const TouchLayer = ({ world, frame }) => {
    // Filter active touches
    const activeTouches = world.touches.filter(
        touch => frame - touch.startedAt < 15
    );
    
    return (
        <div className="touch-layer">
            {activeTouches.map(touch => (
                <TouchIndicator
                    key={touch.id}
                    x={touch.x}
                    y={touch.y}
                    type={touch.type}
                />
            ))}
        </div>
    );
};
```

---

## Styling

### Device Models

```css
.device-iphone_16_pro {
    width: 393px;
    height: 852px;
    border-radius: 55px;
}

.device-pixel_8 {
    width: 412px;
    height: 915px;
    border-radius: 24px;
}
```

### Status Bar Platform Variants

```css
.status-bar-ios {
    /* Dynamic Island */
}

.status-bar-android {
    /* Pill notch */
}
```

---

## Performance Tips

### Use `shouldComponentUpdate`

```tsx
const MessageBubble = React.memo(({ message }) => {
    return <div className="bubble">{message.text}</div>;
}, (prev, next) => {
    // Only re-render if message changed
    return prev.message.id === next.message.id;
});
```

### Virtualize Long Lists

```tsx
const ChatView = ({ messages }) => {
    // Only render visible messages
    const visibleMessages = useMemo(() => {
        return messages.slice(-20);  // Last 20
    }, [messages]);
    
    return <MessageList messages={visibleMessages} />;
};
```

---

## Integration with Remotion

### Composition Setup

```tsx
import { Composition } from "remotion";

<Composition
    id="MyEpisode"
    component={MyVideo}
    durationInFrames={compiled.durationInFrames}
    fps={compiled.fps}
    width={1080}
    height={1920}
/>
```

### Using Sequences

```tsx
import { Sequence } from "remotion";

const MyVideo = () => {
    return (
        <>
            <Sequence from={0} durationInFrames={90}>
                <IntroScene />
            </Sequence>
            <Sequence from={90}>
                <MainScene />
            </Sequence>
        </>
    );
};
```
