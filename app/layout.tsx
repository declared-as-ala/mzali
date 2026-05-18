import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Mzali Boutique', template: `%s — ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Mzali Boutique'}` },
  description: 'Boutique de prêt-à-porter — livraison partout en Tunisie.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
