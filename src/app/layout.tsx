import type { Metadata } from "next";
import "./styles/global.scss";
import "./styles/global.css";
// Removed 'next/head' as it is not used in App Router (app directory)
import { Toaster } from 'sonner';
import { SessionProvider } from "next-auth/react";

// --- 1. THE BRAND SIGNAL (METADATA) ---
export const metadata: Metadata = {
  metadataBase: new URL('https://ontheorbit.com'),
  title: "On The Orbit | Be Undeniable.",
  description: "Don't just graduate. Launch. The 18-month Design Engineering Fellowship for builders who want to ship products, own a .com, and join the top 1%.",
  keywords: [
    "On The Orbit", 
    "Design Engineering", 
    "Design Fellowship", 
    "Next.js Course", 
    "Framer Motion", 
    "Figma", 
    "Next JS", 
    "html css javascript", 
    "Startup School India", 
    "Web Development", 
    "UI/UX Design", 
    "Kolkata Startup"
  ],
  authors: [{ name: "Supriyo & Team" }],
  creator: "On The Orbit",
  publisher: "On The Orbit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // --- 2. THE SOCIAL CARDS (OPEN GRAPH) ---
  openGraph: {
    title: "On The Orbit | Be Undeniable.",
    description: "The industry ignores degrees. It ignores grades. It ignores passionate LinkedIn bios. It cannot ignore proof.",
    url: 'https://ontheorbit.com',
    siteName: 'On The Orbit',
    images: [
      {
        url: 'https://ontheorbit.com/Essentials/og.png', // Ensure this image is updated to the new branding
        width: 1200,
        height: 630,
        alt: 'On The Orbit Fellowship',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On The Orbit | Be Undeniable.',
    description: "The industry ignores degrees. It ignores grades. It ignores passionate LinkedIn bios. It cannot ignore proof.",
    images: ['https://ontheorbit.com/Essentials/og.png'], // Fixed .org typo
    creator: '@weareontheorbit', // Updated to your new handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  // --- 3. THE ENTITY SIGNAL (SCHEMA MARKUP) ---
  // This tells Google: "On The Orbit" is a real Organization, not a typo.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'On The Orbit',
    url: 'https://ontheorbit.com',
    logo: 'https://ontheorbit.com/Essentials/orbit.logo.png',
    sameAs: [
      'https://twitter.com/weareontheorbit',
      'https://instagram.com/weareontheorbit',
      'https://linkedin.com/company/weareontheorbit',
      'https://medium.com/@weareontheorbit'
    ],
    description: 'A design engineering fellowship and product studio based in Kolkata.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kolkata',
      addressRegion: 'WB',
      addressCountry: 'IN'
    },
    founder: {
      '@type': 'Person',
      name: 'Supriyo Mahato'
    }
  };

  return (
    <html lang="en">
      <head>
        {/* In App Router, we use standard tags or metadata. Typekit works best here. */}
        <link rel="stylesheet" href="https://use.typekit.net/ika2qcu.css" />
      </head>
      <body>
        {/* Injecting the Schema for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <SessionProvider>
          <Toaster
            theme="dark"
            duration={1400}
            position="bottom-center"
            // richColors 
          />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}