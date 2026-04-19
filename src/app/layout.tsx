import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wahlen im Freistaat Ostdeutschland",
    template: "%s | Wahlportal Freistaat Ostdeutschland",
  },
  description:
    "Offizielles Simulationsportal des Landeswahlleiters des Freistaates Ostdeutschland: Ergebnisse, Karten, Wahlrecht, direkte Demokratie und Wahlwerkzeuge.",
  metadataBase: new URL("https://wahlen.freistaat-ostdeutschland.de"),
  openGraph: {
    title: "Wahlen im Freistaat Ostdeutschland",
    description:
      "Offizielles Simulationsportal des Landeswahlleiters mit Wahlergebnissen, Karten und Transparenz zur Methodik.",
    type: "website",
    url: "https://wahlen.freistaat-ostdeutschland.de",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wahlportal Freistaat Ostdeutschland",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <a className="skip-link" href="#hauptinhalt">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="hauptinhalt" className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-6 md:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
