import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "zousho",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(GeistSans.className, "font-sans", inter.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkThemeProvider>
            <TooltipProvider>
              <main className="h-screen bg-background text-foreground">
                {children}
                <Toaster
                  richColors
                  position="top-center"
                />
              </main>
            </TooltipProvider>
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
