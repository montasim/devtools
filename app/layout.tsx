import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar/navbar';
import Footer from '@/components/layout/footer';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: 'DevTools - Free Online Developer Tools',
        template: '%s | DevTools',
    },
    description:
        'Free online developer tools for JSON, text processing, Git workflows, and more. Fast, secure, and privacy-focused tools running entirely in your browser.',
    keywords: [
        'developer tools',
        'online dev tools',
        'JSON tools',
        'text tools',
        'JSON formatter',
        'JSON validator',
        'text diff',
        'git branch generator',
        'CSV tools',
        'XML tools',
        'free online tools',
        'browser-based tools',
        'privacy-focused',
        'no server upload',
    ],
    authors: [{ name: 'DevTools' }],
    creator: 'DevTools',
    publisher: 'DevTools',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://devtools.com'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        title: 'DevTools - Free Online Developer Tools',
        description:
            'Free online developer tools for JSON, text processing, Git workflows, and more. Fast, secure, and privacy-focused.',
        siteName: 'DevTools',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'DevTools - Free Online Developer Tools',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DevTools - Free Online Developer Tools',
        description:
            'Free online developer tools for JSON, text processing, Git workflows, and more.',
        images: ['/og-image.png'],
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
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col" suppressHydrationWarning>
                <ThemeProvider>
                    <TooltipProvider>
                        <Navbar />

                        <main className="px-4 sm:px-6 lg:px-8 overflow-visible">{children}</main>

                        <Footer />
                        <Toaster />
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
