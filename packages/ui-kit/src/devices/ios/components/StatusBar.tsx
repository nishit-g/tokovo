import React from 'react';
import { Device } from '@tokovo/shared-types';

// Simple SVG icons as data URIs or components could be used here.
// For now, using text/emoji placeholders or simple shapes for icons.

const WifiIcon = () => (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
        <path d="M10 16C10 16 0 6 0 6C0 6 4 2 10 2C16 2 20 6 20 6C20 6 10 16 10 16Z" />
    </svg>
);

const SignalIcon = () => (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
        <rect x="1" y="12" width="3" height="4" rx="1" />
        <rect x="6" y="8" width="3" height="8" rx="1" />
        <rect x="11" y="4" width="3" height="12" rx="1" />
        <rect x="16" y="0" width="3" height="16" rx="1" />
    </svg>
);

const BatteryIcon = ({ percent }: { percent: number }) => (
    <div style={{ position: 'relative', width: 28, height: 14, border: '1px solid currentColor', borderRadius: 4, padding: 1 }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'currentColor', borderRadius: 2 }} />
        <div style={{ position: 'absolute', right: -3, top: 4, width: 2, height: 6, backgroundColor: 'currentColor', borderTopRightRadius: 2, borderBottomRightRadius: 2 }} />
    </div>
);

export const StatusBar: React.FC<{ device: Device }> = ({ device }) => {
    const isDark = device.theme === 'dark';
    const color = isDark ? '#fff' : '#000';

    return (
        <div
            style={{
                height: 50, // Adjusted for notch
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingLeft: 30,
                paddingRight: 30,
                fontSize: 16,
                fontWeight: '600',
                color: color,
                zIndex: 90,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
            }}
        >
            {/* Time */}
            <div style={{ width: 60, textAlign: 'center' }}>{device.time}</div>

            {/* Right Icons */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon percent={device.batteryPercent} />
            </div>
        </div>
    );
};
