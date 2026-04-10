import React from "react";

type IconProps = { size?: number; color?: string };

function svgProps(size: number, color: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export const MenuIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.65" y2="16.65" />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const AttachIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

export const SmileIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ size = 18, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 14, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const DoubleCheckIcon: React.FC<IconProps> = ({ size = 14, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <polyline points="7 12 10 15 17 8" />
    <polyline points="3 12 6 15 13 8" />
  </svg>
);

export const MuteIcon: React.FC<IconProps> = ({ size = 14, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const ReplyIcon: React.FC<IconProps> = ({ size = 14, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 00-4-4H4" />
  </svg>
);

export const BoldIcon: React.FC<IconProps> = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M6 4h8a4 4 0 010 8H6z" />
    <path d="M6 12h9a4 4 0 010 8H6z" />
  </svg>
);

export const ItalicIcon: React.FC<IconProps> = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <line x1="10" y1="4" x2="18" y2="4" />
    <line x1="6" y1="20" x2="14" y2="20" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
);

export const ListIcon: React.FC<IconProps> = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" fill={color} />
    <circle cx="4" cy="12" r="1" fill={color} />
    <circle cx="4" cy="18" r="1" fill={color} />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 18, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 18, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

export const LocationIcon: React.FC<IconProps> = ({ size = 18, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const FileIcon: React.FC<IconProps> = ({ size = 18, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 18, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size = 22, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export const TeamsIcon: React.FC<IconProps> = ({ size = 22, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 22, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const MoreIcon: React.FC<IconProps> = ({ size = 22, color = "currentColor" }) => (
  <svg {...svgProps(size, color)}>
    <circle cx="5" cy="12" r="1.5" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <circle cx="19" cy="12" r="1.5" fill={color} />
  </svg>
);

export const CallsIcon = PhoneIcon;
