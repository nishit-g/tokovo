import React from "react";

interface BubbleTailProps {
  isMe: boolean;
  color: string;
}

export const BubbleTail: React.FC<BubbleTailProps> = ({ isMe, color }) => {
  if (isMe) {
    return (
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        style={{
          position: "absolute",
          bottom: 0,
          right: -7,
        }}
      >
        <path
          d="M5.188 0H0v11.193c.498-.098.984-.236 1.453-.424a14.937 14.937 0 0 0 4.243-2.636c.634-.556 1.228-1.2 1.74-2.01.327-.519.613-1.1.684-1.732C8.298 2.66 6.953.404 5.188 0Z"
          fill={color}
        />
      </svg>
    );
  } else {
    return (
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        style={{
          position: "absolute",
          bottom: 0,
          left: -7,
          transform: "scaleX(-1)",
        }}
      >
        <path
          d="M5.188 0H0v11.193c.498-.098.984-.236 1.453-.424a14.937 14.937 0 0 0 4.243-2.636c.634-.556 1.228-1.2 1.74-2.01.327-.519.613-1.1.684-1.732C8.298 2.66 6.953.404 5.188 0Z"
          fill={color}
        />
      </svg>
    );
  }
};

export default BubbleTail;
