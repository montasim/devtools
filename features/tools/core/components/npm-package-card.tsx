'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: Record<PackageManager, (pkg: string) => string> = {
    npm: (pkg) => `npm i ${pkg}`,
    pnpm: (pkg) => `pnpm add ${pkg}`,
    yarn: (pkg) => `yarn add ${pkg}`,
    bun: (pkg) => `bun add ${pkg}`,
};

const PM_LABELS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

interface NpmPackageCardProps {
    packageName: string;
    href: string;
}

export function NpmPackageCard({ packageName, href }: NpmPackageCardProps) {
    const [pm, setPm] = useState<PackageManager>('npm');
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();

    const command = INSTALL_COMMANDS[pm](packageName);

    const handleCopy = async () => {
        await copy(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#CB3837]">
                        <svg viewBox="0 0 27 27" className="h-4 w-4" fill="white">
                            <path d="M0 0h27v27H0zM2.7 24.3h10.8V13.5h5.4v10.8h5.4V2.7H2.7z" />
                        </svg>
                    </div>
                    <span className="truncate text-xs font-medium">
                        Same data, in your codebase
                    </span>
                </div>
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-accent"
                >
                    View on npm
                </a>
            </div>

            <div className="mt-2 flex items-center gap-2">
                <div className="flex shrink-0 rounded-md border">
                    {PM_LABELS.map((label) => (
                        <button
                            key={label}
                            onClick={() => setPm(label)}
                            className={`px-2 py-1 text-[10px] font-mono font-medium transition-colors ${
                                pm === label
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            } ${label === 'npm' ? 'rounded-l-md' : ''} ${
                                label === 'bun' ? 'rounded-r-md' : ''
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-[11px] text-foreground">
                    {command}
                </code>
                <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-md border p-1.5 transition-colors hover:bg-accent"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                </button>
            </div>
        </div>
    );
}
