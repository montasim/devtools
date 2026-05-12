import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { siteLinks } from '@/config/seo';

export interface ErrorLayoutAction {
    label: string;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface ErrorLayoutProps {
    code: string;
    icon: LucideIcon;
    color?: 'primary' | 'destructive';
    heading: string;
    description: string;
    primaryAction: ErrorLayoutAction;
    secondaryAction?: ErrorLayoutAction;
    detail?: string;
    footerPrefix?: string;
    feedbackSubject?: string;
}

export default function ErrorLayout({
    code,
    icon: Icon,
    color = 'primary',
    heading,
    description,
    primaryAction,
    secondaryAction,
    detail,
    footerPrefix = 'Think this is a mistake?',
    feedbackSubject,
}: ErrorLayoutProps) {
    const gradientFrom =
        color === 'destructive'
            ? 'from-destructive via-destructive/80 to-destructive/60'
            : 'from-primary via-primary/80 to-primary/60';
    const iconColor = color === 'destructive' ? 'text-destructive' : 'text-primary';

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <Icon className={`h-10 w-10 ${iconColor}`} />
                </div>

                <h1 className="text-8xl font-bold tracking-tighter sm:text-9xl">
                    <span
                        className={`bg-linear-to-r ${gradientFrom} bg-clip-text text-transparent`}
                    >
                        {code}
                    </span>
                </h1>

                <p className="mt-4 text-lg font-medium">{heading}</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>

                {detail && (
                    <div className="mt-4 max-w-md rounded-lg border bg-muted/50 px-4 py-3">
                        <code className="text-xs text-muted-foreground break-all">{detail}</code>
                    </div>
                )}

                <div className="mt-8 flex items-center gap-3">
                    <Button
                        size="lg"
                        variant={
                            primaryAction.variant ??
                            (color === 'destructive' ? 'destructive' : 'default')
                        }
                        onClick={primaryAction.onClick}
                        asChild={!!primaryAction.href}
                        className="h-11 px-6 text-sm"
                    >
                        {primaryAction.href ? (
                            <Link href={primaryAction.href}>
                                {primaryAction.icon && (
                                    <primaryAction.icon className="mr-2 h-4 w-4" />
                                )}
                                {primaryAction.label}
                            </Link>
                        ) : (
                            <>
                                {primaryAction.icon && (
                                    <primaryAction.icon className="mr-2 h-4 w-4" />
                                )}
                                {primaryAction.label}
                            </>
                        )}
                    </Button>
                    {secondaryAction && (
                        <Button
                            size="lg"
                            variant={secondaryAction.variant ?? 'outline'}
                            asChild={!!secondaryAction.href}
                            onClick={secondaryAction.onClick}
                            className="h-11 px-6 text-sm"
                        >
                            {secondaryAction.href ? (
                                <Link href={secondaryAction.href}>
                                    {secondaryAction.icon && (
                                        <secondaryAction.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {secondaryAction.label}
                                </Link>
                            ) : (
                                <>
                                    {secondaryAction.icon && (
                                        <secondaryAction.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {secondaryAction.label}
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <p className="flex items-center gap-1 mt-10 text-xs text-muted-foreground">
                    {footerPrefix}{' '}
                    <a
                        href={`mailto:${siteLinks.feedback}?subject=${encodeURIComponent(feedbackSubject ?? `${code} error`)}`}
                        className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                        <Mail className="h-3 w-3" />
                        Let us know
                    </a>{' '}
                    &mdash; we fix things fast.
                </p>
            </div>
        </div>
    );
}
