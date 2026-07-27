import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gather | Private gatherings, thoughtfully held",
  description: "A private-first home for intimate events and shared memories."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
