import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Cal Sans alternative using system fonts for now
const calSansVariable = "--font-cal-sans";

export const metadata: Metadata = {
  title: "Is The Wi-Fi Good? | Hotel Wi-Fi Quality Directory",
  description: "Find hotels with excellent Wi-Fi for business travelers. Compare hotel internet speeds, reliability, and quality across Singapore, London, and New York.",
  keywords: ["hotel wifi", "business travel", "internet speed", "hotel reviews", "wifi quality"],
  authors: [{ name: "Is The Wi-Fi Good?" }],
  openGraph: {
    title: "Is The Wi-Fi Good? | Hotel Wi-Fi Quality Directory",
    description: "Find hotels with excellent Wi-Fi for business travelers. Compare hotel internet speeds, reliability, and quality.",
    url: "https://isthewifigood.com",
    siteName: "Is The Wi-Fi Good?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is The Wi-Fi Good? | Hotel Wi-Fi Quality Directory",
    description: "Find hotels with excellent Wi-Fi for business travelers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ ['--font-cal-sans' as any]: 'system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif' } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
