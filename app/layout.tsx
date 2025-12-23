import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Budget Buckets",
  description: "Manage your budget with buckets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex gap-6">
            <Link href="/" className="hover:underline font-bold">
              Dashboard
            </Link>
            <Link href="/buckets" className="hover:underline">
              Buckets
            </Link>
            <Link href="/upload" className="hover:underline">
              Upload Statement
            </Link>
            <Link href="/transactions" className="hover:underline">
              Transactions
            </Link>
          </div>
        </nav>
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
