import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production Service",
  description: "SFMC Production Microservice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
