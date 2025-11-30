import React from 'react';
import { AbsoluteFill } from 'remotion';

const AppIcon: React.FC<{ color: string; name: string; icon?: React.ReactNode }> = ({ color, name, icon }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div
            style={{
                width: 68,
                height: 68,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: 30,
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Gloss effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
            }} />

            {icon || name[0]}
        </div>
        <div style={{
            color: 'white',
            fontSize: 13,
            fontWeight: '500',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {name}
        </div>
    </div>
);

// Helper to darken color for gradient
function adjustColor(color: string, amount: number) {
    return color; // Simplified for now, in real app use a color lib
}

export const HomeScreen: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                // Matching Lock Screen Wallpaper
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #2a3b55 100%)',
                paddingTop: 80, // Dynamic Island space
                paddingLeft: 24,
                paddingRight: 24,
            }}
        >
            {/* Wallpaper Overlay for depth */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle at 50% 30%, rgba(76, 161, 175, 0.4) 0%, transparent 60%)',
                    zIndex: 0,
                }}
            />

            <div
                style={{
                    zIndex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    columnGap: 20,
                    rowGap: 30,
                    marginTop: 20,
                }}
            >
                <AppIcon color="#25D366" name="WhatsApp" />
                <AppIcon color="#007AFF" name="Mail" />
                <AppIcon color="#FF3B30" name="Music" />
                <AppIcon color="#5856D6" name="Podcasts" />
                <AppIcon color="#FF9500" name="Notes" />
                <AppIcon color="#AF52DE" name="Photos" />
                <AppIcon color="#34C759" name="Phone" />
                <AppIcon color="#8E8E93" name="Settings" />
                <AppIcon color="#5AC8FA" name="Weather" />
                <AppIcon color="#FF2D55" name="Health" />
                <AppIcon color="#FFCC00" name="Wallet" />
                <AppIcon color="#1C1C1E" name="Camera" />
            </div>

            {/* Page Dots */}
            <div style={{
                position: 'absolute',
                bottom: 115,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                zIndex: 10,
            }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </div>

            {/* Dock */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 18, // Above home indicator
                    left: 16,
                    right: 16,
                    height: 96,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: 32,
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    padding: '0 16px',
                    zIndex: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <AppIcon color="#34C759" name="Phone" />
                <AppIcon color="#007AFF" name="Safari" />
                <AppIcon color="#25D366" name="Messages" />
                <AppIcon color="#FF3B30" name="Music" />
            </div>
        </AbsoluteFill>
    );
};
