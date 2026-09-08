import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MediKiosk Doctor Workspace | AIIMS New Delhi OPD",
  description: "AI-assisted clinical OPD Doctor Workspace for General Medicine OPD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full w-full overflow-hidden bg-slate-100 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
