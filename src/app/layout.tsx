import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import SettingsIcon from "@/components/SettingsIcon";
import "./globals.css";

export const metadata: Metadata = {
  title: "Word Buddies - Spelling Practice for Kids",
  description: "A fun cat-themed spelling practice app for Year 3 students (ages 7-8). Learn spelling with our friendly cat mascot!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <div className="relative min-h-screen">
            {/* Settings Icon - Fixed positioned in top-right */}
            <div className="fixed top-4 right-4 z-50">
              <SettingsIcon />
            </div>
            
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
