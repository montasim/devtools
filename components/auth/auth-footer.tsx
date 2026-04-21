import Link from 'next/link';

interface AuthFooterProps {
    linkText: string;
    linkHref: string;
    linkLabel: string;
}

export function AuthFooter({ linkText, linkHref, linkLabel }: AuthFooterProps) {
    return (
        <p className="text-center text-sm text-muted-foreground">
            {linkText}{' '}
            <Link href={linkHref} className="font-medium text-primary/90 hover:underline">
                {linkLabel}
            </Link>
        </p>
    );
}
