import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KEYRA_FAVICON_SRC } from "@/lib/keyraBrandAssets";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Signaturers — Keyra Signature Vault",
    template: "%s | Signaturers",
  },
  description:
    "Secure aggregation and navigation for every document and signature connected to you across Keyra worlds.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SIGNATURERS_URL?.trim() || "https://signaturers.keyra.ie",
  ),
  icons: {
    icon: KEYRA_FAVICON_SRC,
    shortcut: KEYRA_FAVICON_SRC,
    apple: KEYRA_FAVICON_SRC,
  },
  openGraph: {
    title: "Signaturers — Keyra Signature Vault",
    description:
      "Your secure master vault for signed documents across every authorized Keyra world.",
    siteName: "Keyra Signaturers",
    locale: "en_IE",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IE"
      data-keyra-lane="enterprise"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
        />
      </head>
      <body className="flex min-h-full min-w-0 flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
