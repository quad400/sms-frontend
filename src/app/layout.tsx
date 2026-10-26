import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans, Source_Sans_3, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'School management portals',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
