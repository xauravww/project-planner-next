import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import "./animations.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-serif",
    style: ["normal", "italic"],
    weight: ["300", "400", "500"],
});

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
      <body className={cn(inter.variable, fraunces.variable, inter.className, "min-h-screen bg-background text-foreground")}>
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
