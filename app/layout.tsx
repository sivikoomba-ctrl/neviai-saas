import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeviAI SaaS — CRM & Email Automation",
  description: "AI-Powered CRM and Email Automation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
