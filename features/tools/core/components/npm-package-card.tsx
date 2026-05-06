interface NpmPackageCardProps {
    packageName: string;
    href: string;
}

export function NpmPackageCard({ packageName, href }: NpmPackageCardProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#CB3837]">
                    <svg viewBox="0 0 27 27" className="h-4 w-4" fill="white">
                        <path d="M0 0h27v27H0zM2.7 24.3h10.8V13.5h5.4v10.8h5.4V2.7H2.7z" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium">Same data, in your codebase</span>
                    <span className="text-[11px] text-muted-foreground">
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                            npm i {packageName}
                        </code>
                    </span>
                </div>
            </div>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-accent"
            >
                View on npm
            </a>
        </div>
    );
}
