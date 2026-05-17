import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HighLevel - Little Oummah",
  description: "CRM & Marketing Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Sidebar />
        <div className="ml-60 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
