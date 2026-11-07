import type { Metadata } from "next";
import { Anybody, Red_Hat_Text } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/env";

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-anybody",
  display: "swap",
});

const redHat = Red_Hat_Text({
  subsets: ["latin"],
  variable: "--font-redhat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default:
      "OwnerShot Ads — original listing copy, stills, and a 12-second ad from your photo",
    template: "%s · OwnerShot Ads",
  },
  description:
    "A shop owner photographs their own product. OwnerShot Ads writes original listing copy and makes original stills plus a 12–15 second ad. No stock. No celebrity. No third-party brands.",
  applicationName: "OwnerShot Ads",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anybody.variable} ${redHat.variable}`}>
      <body className="min-h-dvh bg-bone text-carbon antialiased">
        {children}
      </body>
    </html>
  );
}
