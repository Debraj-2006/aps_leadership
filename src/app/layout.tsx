import type { Metadata, Viewport } from "next";
import { Fredoka, Martian_Mono, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaSetup } from "@/components/pwa/pwa-setup";
import "./globals.css";

// Rounded, friendly type for the Doraemon theme.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IEEE AP-S IEM | Leadership Hub",
  description:
    "Committee roster, events, documents, tasks, recognition and handovers for the IEEE Antennas & Propagation Society Student Branch Chapter at IEM.",
  applicationName: "AP-S Hub",
  appleWebApp: { capable: true, title: "AP-S Hub", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0077c0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} ${martianMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <TooltipProvider delay={200}>
            {children}
            <PwaSetup />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
