import type React from "react";
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/src/application/providers/themeProvider";
import { SiteHeader } from "@/src/presentation/components/header/siteHeader";

export const metadata: Metadata = {
  title: "Calendario Laboral",
  description: "Descripción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
