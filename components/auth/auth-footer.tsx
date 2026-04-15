import Link from 'next/link';

interface AuthFooterProps {
    linkText: string;
    linkHref: string;
    linkLabel: string;
}

export function AuthFooter({ linkText, linkHref, linkLabel }: AuthFooterProps) {
    return (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {linkText}{' '}
            <Link href={linkHref} className="font-medium text-primary/90 hover:underline">
                {linkLabel}
            </Link>
        </p>
    );
}
