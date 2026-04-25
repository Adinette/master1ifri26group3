import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { resolveAuthSessionConfig } from "./lib/auth-session-config";
import ConditionalFooter from "./components/ConditionalFooter";
import ConditionalNavbar from "./components/ConditionalNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SFMC Benin - Plateforme d operations",
  description: "Plateforme microservices de supervision, de pilotage et de coordination pour SFMC Benin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionConfig = resolveAuthSessionConfig();

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers
          idleTimeoutSeconds={sessionConfig.idleTimeoutSeconds}
          idleWarningSeconds={sessionConfig.idleWarningSeconds}
        >
          <ConditionalNavbar />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
