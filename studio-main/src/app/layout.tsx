import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { MessagingProvider } from '@/contexts/messaging-context';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'ThesisFlow',
  description: 'A professional web application for comprehensive postgraduate dissertation management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <MessagingProvider>
              {children}
          </MessagingProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
