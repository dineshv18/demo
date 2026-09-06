import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { RoleThemeProvider } from "@/components/site/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ORVANTA Financial — Growing Wealth. Building Futures.",
  description:
    "Institutional-grade Index investing. Transparent tiers, KYC-verified security, and real-time performance tracking.",
};

// Applies the persisted theme class before first paint so the navy/gold
// palette never flashes the wrong way round on load.
const themeBootstrap = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className={`${manrope.variable} ${sora.variable} font-sans antialiased`}
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
