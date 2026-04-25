import { Inter, JetBrains_Mono, Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { Navbar } from '@/components/navbar/navbar';
import { Footer } from '@/components/layout/footer';
import { ConsoleBanner } from '@/components/layout/console-banner';
import { generateRootMetadata } from '@/lib/seo/metadata';
import './globals.css';

const inter = Inter({
    variable: '--font-sans',
    subsets: ['latin'],
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
    display: 'swap',
});

const montserrat = Montserrat({
    variable: '--font-display',
    subsets: ['latin'],
    weight: ['600', '700'],
    display: 'swap',
});

export const metadata = generateRootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full antialiased" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${jetbrainsMono.variable} ${montserrat.variable} flex min-h-full flex-col font-sans`}
            >
                <Providers>
                    <ConsoleBanner />
                    <Navbar />
                    <main className="flex-1 overflow-visible px-4 sm:px-6 lg:px-8">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
