import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "PropertyPro — Unified Property Management Platform",
    template: "%s | PropertyPro",
  },
  description:
    "Enterprise property management platform for modern real estate operations. Manage properties, tenants, maintenance, bookings, and payments in one unified dashboard.",
  keywords: [
    "property management",
    "real estate",
    "tenant management",
    "maintenance tracking",
    "booking system",
    "property management software",
    "landlord dashboard",
  ],
  authors: [{ name: "PropertyPro" }],
  creator: "PropertyPro",
  publisher: "PropertyPro",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PropertyPro",
    title: "PropertyPro — Unified Property Management",
    description:
      "Enterprise property management platform for modern real estate operations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PropertyPro Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertyPro — Unified Property Management",
    description:
      "Enterprise property management platform for modern real estate operations.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}