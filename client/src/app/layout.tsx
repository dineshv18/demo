import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { RoleThemeProvider } from "@/components/site/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORVANTA Financial — Institutional Forex & Crypto CFDs",
  description:
    "Institutional-grade Forex and Crypto CFD trading. Deep liquidity, transparent pricing, and enterprise security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;r.style.setProperty("--brand","oklch(0.72 0.14 85)");r.style.setProperty("--brand-2","oklch(0.64 0.15 78)");r.style.setProperty("--brand-glow","oklch(0.80 0.13 90)");r.style.setProperty("--ring","oklch(0.72 0.14 85)")}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <RoleThemeProvider>
            {children}
          </RoleThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
