import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TestDataProvider } from "@/lib/TestContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adatest App",
  description: "Find and fix bugs in natural language machine learning models using adaptive testing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <TestDataProvider>
        <body className={inter.className}>{children}</body>
      </TestDataProvider>
    </html>
  );
}
