import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { identity } from "@/lib/profile";
import { activeRoles, portfolio } from "@/lib/data";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE = "https://piyush-mishra-00.github.io/Portfolio";
const roleList = activeRoles.map((r) => r.name).join(" · ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${identity.name} — ${roleList || "Engineer"}`,
    template: `%s — ${identity.name}`,
  },
  description: `${identity.name}: ${portfolio.stats.projects} public projects across ${activeRoles.length} engineering roles — ${roleList}. Every project is generated from live GitHub data.`,
  keywords: [identity.name, ...activeRoles.map((r) => r.name), "portfolio", "GitHub", "software engineer"],
  authors: [{ name: identity.name, url: SITE }],
  creator: identity.name,
  openGraph: {
    type: "profile",
    url: SITE,
    title: `${identity.name} — ${roleList}`,
    description: `${portfolio.stats.projects} public projects across ${activeRoles.length} engineering roles.`,
    siteName: `${identity.name} · Portfolio`,
  },
  twitter: { card: "summary_large_image", creator: "@its_Mishra_00" },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE },
  manifest: "/Portfolio/manifest.webmanifest",
  icons: { icon: "/Portfolio/icon.svg", apple: "/Portfolio/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: identity.name },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never trap a user who needs to zoom.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
  ],
};

/**
 * Resolves the theme before first paint. Inline because a stylesheet-driven
 * default would flash the wrong palette on load.
 */
const THEME_BOOT = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
  document.documentElement.setAttribute('data-theme',t);
  document.documentElement.setAttribute('data-brief',localStorage.getItem('brief')||'off');
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();
`;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: identity.name,
  url: SITE,
  email: `mailto:${identity.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Lucknow", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
  jobTitle: activeRoles.map((r) => r.name),
  sameAs: [
    "https://github.com/PIYUSH-MISHRA-00",
    "https://www.linkedin.com/in/piyush-mishra-00",
    "https://orcid.org/0000-0001-9775-1596",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </head>
      <body>
        <div className="aurora" aria-hidden />
        <div className="grid-veil" aria-hidden />
        <a
          href="#work"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to work
        </a>
        {children}
      </body>
    </html>
  );
}
