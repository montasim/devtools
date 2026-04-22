import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { Navbar } from '@/components/navbar/navbar';
import { Footer } from '@/components/layout/footer';
import { generateRootMetadata } from '@/lib/seo/metadata';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = generateRootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full antialiased" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col font-sans`}
            >
                <Providers>
                    <Navbar />
                    <main className="flex-1 overflow-visible px-4 sm:px-6 lg:px-8">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
