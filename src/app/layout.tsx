import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "TempestIQ - Win More Jobs, Prove Damage, Move Faster",
  description: "We tell you who to call, when, and why they'll say yes. Storm verification, outreach scripts, and first-mover advantage for roofers, restoration, solar, fence & gutter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('tempestiq-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          <ScrollToTopOnLoad />
          {children}
        </Providers>
      </body>
    </html>
  );
}
