import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
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
  title: "PDF Assistant",
  description: "Upload a PDF and ask questions about it using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Show when="signed-out">
            {/* Centered sign-in / sign-up screen */}
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
              <h1 className="text-2xl font-semibold text-gray-800">PDF Assistant</h1>
              <p className="text-sm text-gray-500">Sign in to get started</p>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <button className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </Show>

          <Show when="signed-in">
            {/* Top bar with user avatar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-20">
              <span className="text-sm font-semibold text-gray-800">PDF Assistant</span>
              <UserButton />
            </nav>
            {children}
          </Show>
        </body>
      </html>
    </ClerkProvider>
  );
}
