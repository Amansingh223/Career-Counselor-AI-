import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerLift | AI Career Counselor",
  description:
    "AI-powered career counseling for women restarting their careers. Get personalized career recommendations, skill gap analysis, and a 90-day learning roadmap.",
  keywords: "women career, career restart, AI career counselor, skill gap, learning roadmap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased">{children}</body>
    </html>
  );
}
