import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PortCheck AI — Nhava Sheva Customs Cross-Check & Extraction",
  description: "Enterprise multi-document AI extraction, discrepancy detection, and ICEGATE export for customs clearance at Nhava Sheva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
