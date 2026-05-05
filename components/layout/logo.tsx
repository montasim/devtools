import Link from 'next/link';
import { siteLinks } from '@/config/seo';
import { DevLogo } from '@/lib/og/dev-logo';

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <DevLogo className="h-8 w-8 text-primary" animated aria-hidden="true" />
            <span className="bg-linear-to-r from-primary via-primary/70 to-primary bg-size-[200%_auto] bg-clip-text font-medium text-transparent animate-[shimmer_3s_ease-in-out_infinite]">
                {siteLinks.name}
            </span>
        </Link>
    );
}
