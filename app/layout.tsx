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

/**
 * FAVICON SETUP
 * -------------
 * Next.js automatically serves a favicon when you drop an icon file in one of
 * these locations. No <link> tag or extra code is required.
 *
 *   app/favicon.ico        <- preferred (App Router convention)
 *   public/favicon.ico     <- also works
 *
 * Place your .ico file in either path and Next.js will wire it up on build.
 * (You can additionally add app/icon.png and app/apple-icon.png for higher-res
 * and iOS home-screen icons if you want.)
 */

export const metadata: Metadata = {
  title: "UX Client Onboarding | Kartheepan",
  description:
    "Professional UX/UI project onboarding portal for collecting project requirements, goals, audience insights, key features, timelines, and design preferences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
