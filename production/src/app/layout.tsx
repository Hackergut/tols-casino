import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoldenX Casino — Play & Win",
  description:
    "Premium online casino with provably fair games, slots, live dealers, and instant withdrawals.",
  keywords: [
    "GoldenX",
    "casino",
    "slots",
    "live casino",
    "provably fair",
    "crypto casino",
  ],
  authors: [{ name: "GoldenX Casino" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GoldenX Casino — Play & Win",
    description:
      "Premium online casino with provably fair games, slots, live dealers, and instant withdrawals.",
    siteName: "GoldenX Casino",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoldenX Casino — Play & Win",
    description:
      "Premium online casino with provably fair games, slots, live dealers, and instant withdrawals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
