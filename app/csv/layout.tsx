import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CSV Tools - Process and Manipulate CSV Files',
    description:
        'Free online CSV tools. Process, manipulate, and work with CSV files directly in your browser. No data upload required - all processing happens locally.',
    keywords: [
        'CSV tools',
        'CSV editor',
        'CSV viewer',
        'CSV parser',
        'CSV to JSON',
        'JSON to CSV',
        'CSV processing',
        'online CSV tools',
        'CSV formatter',
        'CSV validator',
    ],
    alternates: {
        canonical: '/csv',
    },
    openGraph: {
        type: 'website',
        url: '/csv',
        title: 'CSV Tools - Process and Manipulate CSV Files',
        description:
            'Free online CSV tools. Process and manipulate CSV files directly in your browser.',
        images: [
            {
                url: '/og-csv.png',
                width: 1200,
                height: 630,
                alt: 'CSV Tools - Free Online CSV Processing',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CSV Tools - Free Online CSV Processing',
        description: 'Free online CSV tools. Process and manipulate CSV files in your browser.',
        images: ['/og-csv.png'],
    },
};

export default function CsvLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
