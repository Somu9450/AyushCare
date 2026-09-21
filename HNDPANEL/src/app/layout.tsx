import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AyushCare - Digital Health OS | Hospital & OPD Portal",
  description: "AyushCare Central Health Operations, Doctor Workspace & OPD Control Desk",
  icons: {
    icon: [
      { url: "/ayushCareLogo.png", type: "image/png" },
    ],
    shortcut: "/ayushCareLogo.png",
    apple: "/ayushCareLogo.png",
  },
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
