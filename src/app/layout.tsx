import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Lexend } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Bayside Hub", template: "%s | Bayside Hub" },
  description:
    "Bayside Hub — your one-stop home for announcements, clubs, events, and opportunities at Bayside High School.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="h-full bg-content-bg text-ink">{children}</body>
    </html>
  );
}
