import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/SignOutButton";
import { getUser } from "@/lib/supabase/user";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Summarizer",
  description: "Summarize reports using AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-background text-foreground antialiased">
        <header className="border-b">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
              Summarizer
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <Link
                  href="/history"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  History
                </Link>
                <SignOutButton />
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
