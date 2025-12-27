import type { Metadata } from 'next';
import { Cormorant_Garamond, Antic_Didone } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const anticDidone = Antic_Didone({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-antic',
});

export const metadata: Metadata = {
  title: 'Landing Page',
  description: 'Landing page con CMS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${anticDidone.variable}`}>
      <body>{children}</body>
    </html>
  );
}

