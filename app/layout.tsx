import type { Metadata } from "next";
import { PageTransition } from "@/components/ui/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Campus Accessories", template: "%s | Campus Accessories" },
  description:
    "Phone accessories for campus life, with pickup and campus delivery.",
  openGraph: {
    title: "Campus Accessories",
    description:
      "Phone accessories for campus life, with pickup and campus delivery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
