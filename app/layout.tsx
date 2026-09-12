import type { Metadata, Viewport } from "next";
import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "KinderCare MN",
  description: "Цэцэрлэгийн өдөр тутмын тайлан систем",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3c634d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
