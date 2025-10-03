import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Word Buddies - Spelling Practice for Kids",
  description: "A fun cat-themed spelling practice app for Years 1-4 students (ages 5-9). Learn spelling with our friendly cat mascot!",
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
            <ClientLayout>{children}</ClientLayout>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
