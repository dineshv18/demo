import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { RoleThemeProvider } from "@/components/site/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
            __html: `(function(){try{var r=document.documentElement;r.style.setProperty("--brand","#00A94F");r.style.setProperty("--brand-2","#00B956");r.style.setProperty("--brand-glow","#00B956");r.style.setProperty("--ring","#00A94F")}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${manrope.variable} font-sans antialiased`}
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
