import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ThemeProvider } from "@/components/ThemeProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Leafsprint",
    template: "%s — Leafsprint",
  },
  description:
    "Read daily, keep the leaf alive. An open-source home for building a reading habit.",
  appleWebApp: {
    capable: true,
    title: "Leafsprint",
    statusBarStyle: "default",
  },
  applicationName: "Leafsprint",
};

export const viewport: Viewport = {
  themeColor: "#f7f2e7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${fraunces.variable} ${karla.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative">
        <ThemeProvider />
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
