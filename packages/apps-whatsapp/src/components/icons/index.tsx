/**
 * WhatsApp Icons - Authentic iOS SVG replicas
 */

import React from "react";

export const ChevronLeftIcon = () => (
    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const VideoCallIcon = () => (
    <svg width="84" height="60" viewBox="0 0 28 20" fill="none">
        <rect x="1" y="3" width="18" height="14" rx="3" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M19 8L26 4V16L19 12V8Z" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

export const PhoneCallIcon = () => (
    <svg width="60" height="60" viewBox="0 0 20 20" fill="none">
        <path d="M18.5 14.3V16.8C18.5 17.4 18.1 17.9 17.5 18C17.1 18 16.7 18 16.3 18C8.5 17.3 2.7 11.5 2 3.7C2 3.3 2 2.9 2 2.5C2.1 1.9 2.6 1.5 3.2 1.5H5.7C6.2 1.5 6.6 1.8 6.7 2.3C6.8 3 7 3.7 7.2 4.3C7.3 4.7 7.2 5.1 6.9 5.4L5.7 6.6C6.9 8.8 8.7 10.6 10.9 11.8L12.1 10.6C12.4 10.3 12.8 10.2 13.2 10.3C13.8 10.5 14.5 10.7 15.2 10.8C15.7 10.9 16 11.3 16 11.8V14.3H18.5Z" stroke="#007AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlusCircleIcon = () => (
    <svg width="90" height="90" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="14" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M15 8V22M8 15H22" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const CameraFillIcon = () => (
    <svg width="84" height="72" viewBox="0 0 28 24" fill="#007AFF">
        <path d="M4 6C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H24C25.1 22 26 21.1 26 20V8C26 6.9 25.1 6 24 6H20L18 3H10L8 6H4ZM14 18C11.2 18 9 15.8 9 13C9 10.2 11.2 8 14 8C16.8 8 19 10.2 19 13C19 15.8 16.8 18 14 18Z" />
    </svg>
);

export const MicrophoneFillIcon = () => (
    <svg width="66" height="90" viewBox="0 0 22 30" fill="#007AFF">
        <rect x="6" y="2" width="10" height="16" rx="5" />
        <path d="M4 14V15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15V14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M11 23V28M8 28H14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const DoubleCheckIcon: React.FC<{ read?: boolean }> = ({ read = false }) => (
    <svg width="48" height="30" viewBox="0 0 16 10" fill="none">
        <path d="M1 5L4 8L10 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8 8L14 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M8 5V19L19 12L8 5Z" />
    </svg>
);

export const PauseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
    </svg>
);
