import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.canvasjob.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "canvasjob",
    template: "%s | canvasjob",
  },
  description: "Smarter job hunting: filter listings and track applications.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "canvasjob",
    description: "Smarter job hunting: filter listings and track applications.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "canvasjob" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "canvasjob",
    description: "Smarter job hunting: filter listings and track applications.",
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
