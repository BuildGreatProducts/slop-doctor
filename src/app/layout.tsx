import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Header } from "@/components/features/Header";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { geistMono, switzer } from "./fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Slop Doctor",
  description: "The doctor can see you now. Check your landing page for AI slop.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${switzer.variable} ${geistMono.variable}`}>
        <body>
          <ConvexClientProvider>
            <Header />
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
