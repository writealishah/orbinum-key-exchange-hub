import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orbinum Key Swap Hub 🛡️ | ZK Disclosure Key Exchange',
  description: 'Fair 1-for-1 ZK Disclosure Key Exchange Hub for Orbinum Network Testnet participants. Swap keys easily to complete Weekly Selective Disclosure quests.',
  keywords: ['Orbinum', 'Testnet', 'Zero Knowledge', 'Disclosure Key', 'Web3', 'Key Exchange', 'Quests'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
        <div className="ambient-bg" />
        {children}
      </body>
    </html>
  );
}
