import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KriptoApp",
  description: "Cryptography Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex bg-white text-slate-900 selection:bg-slate-200">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
