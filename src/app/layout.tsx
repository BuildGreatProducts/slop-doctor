import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Footer } from "@/components/features/Footer";
import { Header } from "@/components/features/Header";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { geistMono, switzer } from "./fonts";
import "@/styles/globals.css";

const description = "The doctor can see you now. Check your landing page for AI slop.";

export const metadata: Metadata = {
  title: "Slop Doctor",
  description,
  openGraph: { title: "Slop Doctor", description, siteName: "Slop Doctor", type: "website" },
  twitter: { card: "summary", title: "Slop Doctor", description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${switzer.variable} ${geistMono.variable}`}>
        <body className="app">
          <ConvexClientProvider>
            <Header />
            <div className="page">{children}</div>
            <Footer />
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
