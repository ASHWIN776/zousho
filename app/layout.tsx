import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Recall",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkThemeProvider>
            <main className="h-screen bg-background text-foreground">
              {children}
              <Toaster
                richColors
                position="top-center"
              />
            </main>
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
