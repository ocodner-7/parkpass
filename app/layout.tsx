import type { Metadata } from "next";
import { Geist, Geist_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import { QueryProvider } from "@/app/app-config/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ParkPass",
  description: "London parking permits",
  icons: {
    icon: "/images/logo/emblem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="bg-surface-primary text-content-primary min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
