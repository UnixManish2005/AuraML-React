import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AuraML Platform",
    template: "%s | AuraML Platform",
  },
  description: "AI-powered EdTech platform for Machine Learning, Data Science, and Python training",
  keywords: ["AI", "Machine Learning", "Data Science", "Python", "EdTech", "Online Learning"],
  authors: [{ name: "AuraML Team" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
        suppressHydrationWarning        // ← ADD THIS
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"         // ← CHANGE dark → system
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}