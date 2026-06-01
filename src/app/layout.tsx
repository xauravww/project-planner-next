import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animations.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/SessionProvider";

// Resend-style 3-family stack:
// - Inter        → all UI and marketing body (stand-in for ABC Favorit)
// - Fraunces     → hero/section serif headlines (stand-in for Domaine Display)
// - Geist Mono   → code wells, inline code, mono labels
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-serif",
    style: ["normal", "italic"],
    weight: ["300", "400", "500"],
});
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "NebulaPlan - The Future of Project Planning",
  description: "A premium project planning tool for modern developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, fraunces.variable, geistMono.variable, inter.className, "min-h-screen bg-background text-foreground")}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
