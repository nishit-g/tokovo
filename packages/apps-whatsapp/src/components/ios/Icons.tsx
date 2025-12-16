import React from "react";
import { Theme } from "./theme";

// Standard icon size for touch targets is ~44x44, icons themselves usually 24x24 or 30x30

export const ChevronLeftIcon = ({ color }: { color: string }) => (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const VideoCallIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 28 20" fill="none">
        <rect x="1" y="3" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" />
        <path d="M19 8L26 4V16L19 12V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

export const PhoneCallIcon = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M18.5 14.3V16.8C18.5 17.4 18.1 17.9 17.5 18C17.1 18 16.7 18 16.3 18C8.5 17.3 2.7 11.5 2 3.7C2 3.3 2 2.9 2 2.5C2.1 1.9 2.6 1.5 3.2 1.5H5.7C6.2 1.5 6.6 1.8 6.7 2.3C6.8 3 7 3.7 7.2 4.3C7.3 4.7 7.2 5.1 6.9 5.4L5.7 6.6C6.9 8.8 8.7 10.6 10.9 11.8L12.1 10.6C12.4 10.3 12.8 10.2 13.2 10.3C13.8 10.5 14.5 10.7 15.2 10.8C15.7 10.9 16 11.3 16 11.8V14.3H18.5Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlusCircleIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="14" stroke={color} strokeWidth="1.8" />
        <path d="M15 8V22M8 15H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const CameraFillIcon = ({ color }: { color: string }) => (
    <svg width="24" height="20" viewBox="0 0 28 24" fill={color}>
        <path d="M4 6C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H24C25.1 22 26 21.1 26 20V8C26 6.9 25.1 6 24 6H20L18 3H10L8 6H4ZM14 18C11.2 18 9 15.8 9 13C9 10.2 11.2 8 14 8C16.8 8 19 10.2 19 13C19 15.8 16.8 18 14 18Z" />
    </svg>
);

export const MicrophoneFillIcon = ({ color }: { color: string }) => (
    <svg width="18" height="24" viewBox="0 0 22 30" fill={color}>
        <rect x="6" y="2" width="10" height="16" rx="5" />
        <path d="M4 14V15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15V14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M11 23V28M8 28H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const DoubleCheckIcon = ({ read, size = 16 }: { read?: boolean; size?: number }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 16 10" fill="none">
        <path d="M1 5L4 8L10 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8 8L14 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ==========================================
// UI ICONS
// ==========================================

export const SearchIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const FilterIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ArchiveIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20.5 5H3.5C2.67157 5 2 5.67157 2 6.5V8H22V6.5C22 5.67157 21.3284 5 20.5 5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12L12 14L14 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const NewChatIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    // Note: iOS standard is often a square with pencil, but plus is used too. Keeping plus for simplicity or circle-plus.
    // iOS WhatsApp top-right is actually a square with a pencil (Compose).
);

export const ComposeIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ==========================================
// TAB BAR ICONS
// ==========================================

export const UpdatesIcon = ({ color, filled }: { color: string, filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={filled ? "0" : "2"} fill={filled ? color : "none"} />
        {filled ? (
            <path d="M12 6V12L16 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {!filled ? (<circle cx="12" cy="12" r="2" fill={color} />) : null}
        {/* Simplified conceptual icon for Updates/Status */}
    </svg>
);

export const CallsTabIcon = ({ color, filled }: { color: string, filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? color : "none"}>
        <path d="M22 16.92V19.92C22 20.4706 21.5532 20.916 21.0028 20.916C20.6725 20.916 16.6 20 16.6 20C16.6 20 13 18.5 10 15.5C7 12.5 5.5 8.9 5.5 8.9C5.5 8.9 4.6 4.8 4.6 4.47C4.6 3.92 5.04543 3.47 5.59259 3.47H8.59259C8.97495 3.47 9.32432 3.72221 9.44477 4.08354C9.55998 4.42878 9.8 5 9.8 5C9.8 5 10.3 6.3 10.5 6.7C10.7 7.1 10.5 7.6 10.2 7.9L8.90001 9.2C8.90001 9.2 10.6 13.9 14.3 17.6C18 21.3 22.8 23 22.8 23L24.1 21.7C24.4 21.4 24.9 21.2 25.3 21.4C25.7 21.6 27 22.1 27 22.1C27 22.1 27.5 22.3 27.9 22.5C28.2 22.6 28.5 22.9 28.5 23.3V26.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CommunitiesIcon = ({ color, filled }: { color: string, filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? color : "none"}>
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.01 6.11683 19.0101 7.005C19.0103 7.89318 18.7127 8.75618 18.1682 9.45788C17.6237 10.1596 16.861 10.6601 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChatsIcon = ({ color, filled }: { color: string, filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? color : "none"}>
        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11H21 11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    // Just using a single chat bubble for simplicity, standard "Chats" icon is two bubbles often.
);

export const SettingsIcon = ({ color, filled }: { color: string, filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? color : "none"}>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.4 15C19.78 14.53 20 13.92 20 13.25V10.75C20 10.08 19.78 9.47 19.4 9L21.06 6.13C21.36 5.61 21.19 4.95 20.67 4.65L18.5 3.4C17.98 3.1 17.32 3.27 17.02 3.79L15.35 6.66C14.77 6.42 14.16 6.27 13.52 6.22L13.16 2.94C13.09 2.34 12.59 1.9 12 1.9H9.5C8.91 1.9 8.41 2.34 8.34 2.94L7.98 6.22C7.34 6.27 6.73 6.42 6.15 6.66L4.48 3.79C4.18 3.27 3.52 3.1 3 3.4L0.830002 4.65C0.310002 4.95 0.140002 5.61 0.440002 6.13L2.1 9C1.72 9.47 1.5 10.08 1.5 10.75V13.25C1.5 13.92 1.72 14.53 2.1 15L0.440002 17.87C0.140002 18.39 0.310002 19.05 0.830002 19.35L3 20.6C3.52 20.9 4.18 20.73 4.48 20.21L6.15 17.34C6.73 17.58 7.34 17.73 7.98 17.78L8.34 21.06C8.41 21.66 8.91 22.1 9.5 22.1H12C12.59 22.1 13.09 21.66 13.16 21.06L13.52 17.78C14.16 17.73 14.77 17.58 15.35 17.34L17.02 20.21C17.32 20.73 17.98 20.9 18.5 20.6L20.67 19.35C21.19 19.05 21.36 18.39 21.06 17.87L19.4 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
