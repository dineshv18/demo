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
  title: "ORVANTA Financial — Institutional-Grade Index Investing",
  description:
    "Institutional-grade Index investing. Transparent tiers, KYC-verified security, and real-time performance tracking.",
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
            __html: `(function(){try{var r=document.documentElement;r.style.setProperty("--brand","oklch(0.58 0.19 293)");r.style.setProperty("--brand-2","oklch(0.52 0.20 286)");r.style.setProperty("--brand-glow","oklch(0.68 0.17 298)");r.style.setProperty("--ring","oklch(0.58 0.19 293)")}catch(e){}})();`,
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
