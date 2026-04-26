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

  // Script anti-FOUC : applique la classe `.dark` sur <html> AVANT l'hydratation React,
  // selon le choix utilisateur (localStorage) ou la préférence système.
  const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='dark'||s==='light'||s==='system')?s:'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');}r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
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
