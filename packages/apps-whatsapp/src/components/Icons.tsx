import React from "react";
import { whatsappColors } from "./theme.js";

// =============================================================================
// NAVIGATION ICONS
// =============================================================================

export const ChevronLeftIcon = ({
  color = whatsappColors.primary,
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 12 20" fill="none">
    <path d="M10 2L2 10L10 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon = ({
  color = whatsappColors.textSecondary,
  size = 14,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size * 0.5} height={size} viewBox="0 0 7 12" fill="none">
    <path d="M1 1L6 6L1 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// =============================================================================
// CHAT ACTION ICONS
// =============================================================================

export const VideoCallIcon = ({
  color = whatsappColors.primary,
}: {
  color?: string;
}) => (
  <svg width="24" height="24" viewBox="0 0 28 20" fill="none">
    <rect x="1" y="3" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <path d="M19 8L26 4V16L19 12V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const PhoneCallIcon = ({
  color = whatsappColors.primary,
}: {
  color?: string;
}) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M18.5 14.3V16.8C18.5 17.4 18.1 17.9 17.5 18C17.1 18 16.7 18 16.3 18C8.5 17.3 2.7 11.5 2 3.7C2 3.3 2 2.9 2 2.5C2.1 1.9 2.6 1.5 3.2 1.5H5.7C6.2 1.5 6.6 1.8 6.7 2.3C6.8 3 7 3.7 7.2 4.3C7.3 4.7 7.2 5.1 6.9 5.4L5.7 6.6C6.9 8.8 8.7 10.6 10.9 11.8L12.1 10.6C12.4 10.3 12.8 10.2 13.2 10.3C13.8 10.5 14.5 10.7 15.2 10.8C15.7 10.9 16 11.3 16 11.8V14.3H18.5Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// =============================================================================
// HEADER ACTION ICONS
// =============================================================================

export const CameraFillIcon = ({
  color = whatsappColors.primary,
}: {
  color?: string;
}) => (
  <svg width="28" height="24" viewBox="0 0 28 24" fill={color}>
    <path d="M4 6C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H24C25.1 22 26 21.1 26 20V8C26 6.9 25.1 6 24 6H20L18 3H10L8 6H4ZM14 18C11.2 18 9 15.8 9 13C9 10.2 11.2 8 14 8C16.8 8 19 10.2 19 13C19 15.8 16.8 18 14 18Z" />
  </svg>
);

export const ComposeIcon = ({
  color = whatsappColors.primary,
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PlusCircleIcon = ({
  color = whatsappColors.primary,
}: {
  color?: string;
}) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="14" stroke={color} strokeWidth="1.8" />
    <path d="M15 8V22M8 15H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const NewChatIcon = ({
  color = whatsappColors.primary,
}: {
  color?: string;
}) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// =============================================================================
// SEARCH & FILTER ICONS
// =============================================================================

export const SearchIcon = ({
  color = whatsappColors.textSecondary,
  size = 18,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 16L12.5 12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FilterIcon = ({
  color = whatsappColors.textSecondary,
}: {
  color?: string;
}) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// =============================================================================
// CHAT LIST ICONS
// =============================================================================

export const ArchiveIcon = ({
  color = whatsappColors.textSecondary,
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 8V21H3V8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 3H1V8H23V3Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 12H14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MutedIcon = ({
  color = whatsappColors.textSecondary,
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 9L17 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 9L23 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PinIcon = ({
  color = whatsappColors.textSecondary,
  size = 14,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 17V22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 17H19L17 10V4C17 3.46957 16.7893 2.96086 16.4142 2.58579C16.0391 2.21071 15.5304 2 15 2H9C8.46957 2 7.96086 2.21071 7.58579 2.58579C7.21071 2.96086 7 3.46957 7 4V10L5 17Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({
  color = whatsappColors.textSecondary,
  size = 14,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="2.5" stroke={color} strokeWidth="1.8" />
    <path d="M8 10V7.8C8 5.14903 10.149 3 12.8 3C15.451 3 17.6 5.14903 17.6 7.8V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// =============================================================================
// MESSAGE STATUS ICONS
// =============================================================================

export const DoubleCheckIcon = ({
  read = false,
  size = 16,
}: {
  read?: boolean;
  size?: number;
}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 16 10" fill="none">
    <path
      d="M1 5L4 8L10 2"
      stroke={read ? whatsappColors.readReceipt : whatsappColors.sentReceipt}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5L8 8L14 2"
      stroke={read ? whatsappColors.readReceipt : whatsappColors.sentReceipt}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SingleCheckIcon = ({
  color = whatsappColors.sentReceipt,
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 16 10" fill="none">
    <path d="M1 5L5 9L15 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MicrophoneFillIcon = ({
  color = whatsappColors.primary,
}: {
  color?: string;
}) => (
  <svg width="18" height="24" viewBox="0 0 22 30" fill={color}>
    <rect x="6" y="2" width="10" height="16" rx="5" />
    <path d="M4 14V15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15V14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M11 23V28M8 28H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// =============================================================================
// TAB BAR ICONS
// =============================================================================

export const UpdatesIcon = ({
  color = whatsappColors.tabInactive,
  filled = false,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    {filled ? (
      <>
        <circle cx="12.5" cy="12.5" r="10" fill={color} />
        <circle cx="12.5" cy="12.5" r="4" fill="white" />
      </>
    ) : (
      <>
        <circle cx="12.5" cy="12.5" r="10" stroke={color} strokeWidth="1.5" strokeDasharray="5 3" />
        <circle cx="12.5" cy="12.5" r="3" fill={color} />
      </>
    )}
  </svg>
);

export const CallsTabIcon = ({
  color = whatsappColors.tabInactive,
  filled = false,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <path 
      d="M21.5 17.3V19.8C21.5 20.4 21.1 20.9 20.5 21C20.1 21 19.7 21 19.3 21C11.5 20.3 5.7 14.5 5 6.7C5 6.3 5 5.9 5 5.5C5.1 4.9 5.6 4.5 6.2 4.5H8.7C9.2 4.5 9.6 4.8 9.7 5.3C9.8 6 10 6.7 10.2 7.3C10.3 7.7 10.2 8.1 9.9 8.4L8.7 9.6C9.9 11.8 11.7 13.6 13.9 14.8L15.1 13.6C15.4 13.3 15.8 13.2 16.2 13.3C16.8 13.5 17.5 13.7 18.2 13.8C18.7 13.9 19 14.3 19 14.8V17.3H21.5Z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill={filled ? color : "none"}
    />
  </svg>
);

export const CommunitiesIcon = ({
  color = whatsappColors.tabInactive,
  filled = false,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : "none"} />
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : "none"} />
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.01 6.11683 19.0101 7.005C19.0103 7.89318 18.7127 8.75618 18.1682 9.45788C17.6237 10.1596 16.861 10.6601 16 10.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatsIcon = ({
  color = whatsappColors.tabInactive,
  filled = false,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <path 
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill={filled ? color : "none"}
    />
  </svg>
);

export const SettingsIcon = ({
  color = whatsappColors.tabInactive,
  filled = false,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <path 
      d="M12.5 15.5C14.1569 15.5 15.5 14.1569 15.5 12.5C15.5 10.8431 14.1569 9.5 12.5 9.5C10.8431 9.5 9.5 10.8431 9.5 12.5C9.5 14.1569 10.8431 15.5 12.5 15.5Z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill={filled ? color : "none"}
    />
    <path 
      d="M20.2 15.5C20.0745 15.7866 20.0399 16.1052 20.1008 16.4125C20.1616 16.7199 20.3152 17.0013 20.54 17.22L20.59 17.27C20.7656 17.4454 20.9048 17.654 21.0002 17.8835C21.0956 18.113 21.1452 18.359 21.1462 18.6075C21.1472 18.856 21.0997 19.1024 21.0062 19.3327C20.9126 19.563 20.7751 19.7728 20.6008 19.9497C20.4266 20.1266 20.2186 20.2668 19.9898 20.3627C19.7609 20.4587 19.5154 20.5088 19.2672 20.5104C19.019 20.5119 18.7729 20.465 18.5429 20.372C18.3129 20.279 18.1032 20.1419 17.926 19.967L17.876 19.917C17.6561 19.6926 17.3732 19.5399 17.0646 19.4797C16.756 19.4196 16.4359 19.4547 16.147 19.5804C15.8635 19.7005 15.6216 19.9013 15.4513 20.1573C15.281 20.4133 15.1898 20.7133 15.189 21.02V21.167C15.189 21.6679 14.9899 22.1482 14.6355 22.5025C14.2812 22.8569 13.8009 23.056 13.3 23.056C12.7991 23.056 12.3188 22.8569 11.9645 22.5025C11.6101 22.1482 11.411 21.6679 11.411 21.167V21.09C11.405 20.7742 11.3034 20.4673 11.1189 20.2089C10.9344 19.9506 10.6754 19.7527 10.376 19.641C10.0871 19.5153 9.76702 19.4802 9.4584 19.5404C9.14979 19.6005 8.86694 19.7532 8.647 19.977L8.597 20.027C8.41979 20.2019 8.21011 20.339 7.98014 20.432C7.75017 20.525 7.5041 20.572 7.2559 20.5704C7.00771 20.5689 6.76223 20.5188 6.53339 20.4229C6.30455 20.327 6.09655 20.1868 5.92133 20.0099C5.7461 19.8331 5.60823 19.6238 5.51472 19.3937C5.42121 19.1637 5.37395 18.9176 5.37557 18.6692C5.37719 18.4207 5.42763 18.1751 5.5241 17.946C5.62057 17.7168 5.76109 17.5085 5.939 17.333L5.989 17.283C6.21338 17.0631 6.36611 16.7802 6.42626 16.4716C6.48641 16.163 6.45131 15.8429 6.3256 15.554C6.20552 15.2705 6.00473 15.0286 5.74872 14.8583C5.49271 14.688 5.19271 14.5968 4.886 14.596H4.739C4.23809 14.596 3.75783 14.3969 3.40351 14.0425C3.04918 13.6882 2.85 13.2079 2.85 12.707C2.85 12.2061 3.04918 11.7258 3.40351 11.3715C3.75783 11.0171 4.23809 10.818 4.739 10.818H4.816C5.13179 10.812 5.43868 10.7104 5.69706 10.5259C5.95543 10.3414 6.15327 10.0824 6.265 9.783C6.39071 9.49412 6.42581 9.17398 6.36566 8.86536C6.30551 8.55675 6.15278 8.2739 5.9284 8.054L5.8784 8.004C5.70349 7.82679 5.5664 7.61711 5.47339 7.38714C5.38038 7.15717 5.3334 6.9111 5.33502 6.6629C5.33664 6.41471 5.38682 6.16923 5.48271 5.94039C5.57861 5.71155 5.71884 5.50355 5.89569 5.32833C6.07255 5.1531 6.28184 5.01523 6.51194 4.92172C6.74203 4.82821 6.98799 4.78095 7.23618 4.78257C7.48438 4.78419 7.72963 4.83463 7.95861 4.9311C8.1876 5.02757 8.39559 5.16809 8.571 5.346L8.621 5.396C8.84094 5.62038 9.12379 5.77311 9.4324 5.83326C9.74102 5.89341 10.0612 5.85831 10.35 5.7326H10.44C10.7235 5.61252 10.9654 5.41173 11.1357 5.15572C11.306 4.89971 11.3972 4.59971 11.398 4.293V4.146C11.398 3.64509 11.5971 3.16483 11.9515 2.81051C12.3058 2.45618 12.7861 2.257 13.287 2.257C13.7879 2.257 14.2682 2.45618 14.6225 2.81051C14.9768 3.16483 15.176 3.64509 15.176 4.146V4.223C15.1768 4.52971 15.268 4.82971 15.4383 5.08572C15.6086 5.34173 15.8505 5.54252 16.134 5.6626C16.4228 5.78831 16.743 5.82341 17.0516 5.76326C17.3602 5.70311 17.6431 5.55038 17.863 5.326L17.913 5.276C18.0884 5.10109 18.2971 4.964 18.5261 4.87099C18.7551 4.77798 19.0001 4.73101 19.2472 4.73263C19.4943 4.73425 19.7388 4.78443 19.9664 4.88032C20.1941 4.97622 20.4009 5.11645 20.5749 5.2933C20.7489 5.47015 20.8857 5.67945 20.9786 5.90954C21.0715 6.13964 21.1181 6.3856 21.1165 6.6338C21.1149 6.88199 21.0647 7.12724 20.9687 7.35622C20.8727 7.5852 20.7325 7.7932 20.5546 7.9686L20.5046 8.0186C20.2802 8.23854 20.1275 8.52139 20.0673 8.83C20.0072 9.13862 20.0423 9.45876 20.168 9.7476V9.8376C20.288 10.1211 20.4888 10.363 20.7449 10.5333C21.0009 10.7036 21.3009 10.7948 21.6076 10.7956H21.7546C22.2555 10.7956 22.7358 10.9948 23.0901 11.3491C23.4444 11.7035 23.6436 12.1837 23.6436 12.6846C23.6436 13.1855 23.4444 13.6658 23.0901 14.0201C22.7358 14.3744 22.2555 14.5736 21.7546 14.5736H21.6776C21.3709 14.5744 21.0709 14.6656 20.8149 14.8359C20.5589 15.0062 20.3581 15.2481 20.238 15.5316L20.2 15.5Z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
