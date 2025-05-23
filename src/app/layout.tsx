import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from '@/components/mirror-trade/app-providers';

// Removed incorrect font initializations:
// const geistSans = GeistSans({ ... });
// const geistMono = GeistMono({ ... });

export const metadata: Metadata = {
  title: 'MirrorTrade',
  description: 'Replicate your friend\'s Sharekhan trades with AI risk assessment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
