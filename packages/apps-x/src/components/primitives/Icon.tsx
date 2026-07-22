import React from "react";
import {
  ArrowLeft,
  AtSign,
  BarChart3,
  Bell,
  BellRing,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  CircleEllipsis,
  Feather,
  Globe2,
  Heart,
  Home,
  Image as ImageIcon,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Pin,
  Play,
  Plus,
  Repeat2,
  Search,
  Send,
  Share,
  Smile,
  Sparkles,
  User,
  Users,
  Video,
  X as Close,
  type LucideIcon,
} from "lucide-react";

const icons = {
  back: ArrowLeft,
  mention: AtSign,
  views: BarChart3,
  bell: Bell,
  bellActive: BellRing,
  bookmark: Bookmark,
  calendar: CalendarDays,
  check: Check,
  chevronDown: ChevronDown,
  moreCircle: CircleEllipsis,
  compose: Feather,
  globe: Globe2,
  like: Heart,
  home: Home,
  image: ImageIcon,
  link: Link2,
  mail: Mail,
  location: MapPin,
  reply: MessageCircle,
  more: MoreHorizontal,
  edit: PenLine,
  pin: Pin,
  play: Play,
  plus: Plus,
  repost: Repeat2,
  search: Search,
  send: Send,
  share: Share,
  smile: Smile,
  sparkle: Sparkles,
  user: User,
  users: Users,
  video: Video,
  close: Close,
} satisfies Record<string, LucideIcon>;

export type XIconName = keyof typeof icons;

export const XIcon: React.FC<{
  name: XIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}> = ({ name, size = 20, color = "currentColor", strokeWidth = 1.85, fill = "none" }) => {
  const Icon = icons[name];
  return <Icon aria-hidden size={size} color={color} strokeWidth={strokeWidth} fill={fill} />;
};

export const XLogo: React.FC<{ size?: number; color?: string }> = ({
  size = 25,
  color = "currentColor",
}) => (
  <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);
