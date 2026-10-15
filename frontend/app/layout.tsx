import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { ThemeProvider } from '../context/ThemeContext';
import { clerkAppearance } from '../lib/clerkTheme';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Interview Simulator | Resume-Aware RAG & Voice AI',
  description:
    'Full-stack AI-powered interview platform simulating resume-aware technical, behavioral, and Codeforces coding interviews with real-time voice, RAG, and analytics.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
      </head>
      <body className="bg-slate-950 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased transition-colors duration-300">
        <ClerkProvider appearance={clerkAppearance}>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}