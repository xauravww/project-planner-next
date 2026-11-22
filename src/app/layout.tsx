import type { Metadata } from "next";
import { Inter, Archivo_Black, Space_Mono } from "next/font/google";
import "./globals.css";
import "./animations.css";
import { cn } from "@/lib/utils";
import { ThemedToaster } from "@/components/ui/ThemedToaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/SessionProvider";

// Kinetic Orange stack:
// - Archivo Black → display headlines (uppercase, heavy)
// - Space Mono    → metadata / labels / UI
// - Inter         → body text
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo_Black({
    subsets: ["latin"],
    variable: "--font-display",
    weight: "400",
});
const spaceMono = Space_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NebulaPlan — AI Project Planning",
  description: "Turn an idea into a working plan. AI project planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, archivo.variable, spaceMono.variable, inter.className, "min-h-screen bg-background text-foreground")}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <ThemedToaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
