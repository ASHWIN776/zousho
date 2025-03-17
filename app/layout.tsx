import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "@/styles/prosemirror.css";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

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
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark
      }}
    >
      <html lang="en" className={GeistSans.className} suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <main className="h-screen bg-background text-foreground">
              {children}
              <Toaster 
                richColors
                position="top-center" 
              />
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
