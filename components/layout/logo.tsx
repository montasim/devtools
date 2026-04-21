import Link from 'next/link';
import { Terminal } from 'lucide-react';

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="font-medium">DevTools</span>
        </Link>
    );
}
