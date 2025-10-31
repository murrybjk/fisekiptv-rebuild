import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConnectionProvider } from "@/components/providers/connection-provider";

// Force dynamic rendering for all routes to prevent SSR issues with video player
export const dynamic = 'force-dynamic'
export const dynamicParams = true

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FisekIPTV - Modern IPTV Player",
  description: "Clean, modern IPTV player built with Next.js and Shadcn UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ConnectionProvider>
          {children}
        </ConnectionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
