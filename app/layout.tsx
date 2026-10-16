import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navigation } from "@/components/navigation";
import { StarfieldCSS } from "@/components/starfield-css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Solr - Interactive Solar System Encyclopedia",
    template: "%s | Solr",
  },
  description:
    "Explore our solar system with interactive 3D visualizations, scientific data from NASA and ESA, and educational tools. A comprehensive encyclopedia of planets, moons, and spacecraft.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#141517",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <StarfieldCSS />
        <Navigation />
        <main className="pt-16">{children}</main>
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
