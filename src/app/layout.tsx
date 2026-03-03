import type { Metadata } from "next";
import { Inter, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Preloader } from "@/components/layout/Preloader";
import { Providers } from "@/components/providers/session-provider";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/schema";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Resh Blog - Resh Community Blog! Latest & Greatest Crypto News!",
    template: "%s | Resh Blog",
  },
  description: "Resh Community Blog! Latest & Greatest Crypto News!",
  keywords: ["crypto", "bitcoin", "ethereum", "blockchain", "cryptocurrency"],
  authors: [{ name: "Resh Community" }],
  creator: "Resh Community",
  metadataBase: new URL("https://resh.community"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resh.community",
    title: "Resh Blog - Resh Community Blog! Latest & Greatest Crypto News!",
    description: "Resh Community Blog! Latest & Greatest Crypto News!",
    siteName: "Resh Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resh Blog - Resh Community Blog! Latest & Greatest Crypto News!",
    description: "Resh Community Blog! Latest & Greatest Crypto News!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate schema data
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" className={cn(redHatDisplay.variable, inter.variable)}>
      <head>
        {/* Schema.org JSON-LD */}
        <JsonLd type="Website" data={websiteSchema} />
        <JsonLd type="Organization" data={organizationSchema} />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <Providers>
          <Preloader />
          <div className="main-content">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
