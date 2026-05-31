import { type Metadata } from "next";
import { Inter } from "next/font/google";
import clsx from "clsx";

import "@/styles/tailwind.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tokovo — Multi-device shows inside phones",
  description:
    "An AI-native studio for multi-device phone shows with simulated apps, camera direction, sound, voice, and vertical rendering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx("antialiased", inter.variable)}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
