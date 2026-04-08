import Link from 'next/link';
import { FileSearch, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorPageLayout } from '@/components/error-pages/error-page-layout';
import { ErrorCodeDisplay } from '@/components/error-pages/error-code-display';
import { ErrorActions } from '@/components/error-pages/error-actions';
import { ErrorSuggestions } from '@/components/error-pages/error-suggestions';

export const metadata = {
    title: '404 - Page Not Found | DevTools',
    description: 'The requested development tool or resource could not be found.',
};

export default function NotFound() {
    const suggestions = [
        'Check the URL for typos',
        'Browse our available tools: <a href="/" class="text-primary hover:underline">JSON</a>, <a href="/text" class="text-primary hover:underline">Text</a>, <a href="/xml" class="text-primary hover:underline">XML</a>, <a href="/csv" class="text-primary hover:underline">CSV</a>',
        'Return to the homepage to start over',
    ];

    return (
        <ErrorPageLayout>
            <ErrorCodeDisplay
                code="404"
                icon={FileSearch}
                title="Endpoint Not Found"
                description="The requested tool or resource does not exist in the DevTools API."
            />

            {/* Terminal Display */}
            <div className="rounded-lg bg-muted p-4 text-left font-mono text-sm sm:text-base">
                <div className="space-y-1">
                    <p className="text-muted-foreground">
                        <span className="text-primary">$</span> curl
                        https://devtools.com/invalid-endpoint
                    </p>
                    <p className="text-destructive">HTTP/1.1 404 Not Found</p>
                    <p className="text-muted-foreground">Content-Type: application/json</p>
                    <p className="mt-2 text-muted-foreground">{`{`}</p>
                    <p className="text-muted-foreground pl-4">
                        <span className="text-foreground">&ldquo;error&ldquo;:</span>{' '}
                        <span className="text-green-500">&ldquo;ROUTE_NOT_FOUND&ldquo;</span>,
                    </p>
                    <p className="text-muted-foreground pl-4">
                        <span className="text-foreground">&ldquo;message&ldquo;:</span>{' '}
                        <span className="text-green-500">
                            &ldquo;The requested endpoint is not registered&ldquo;
                        </span>
                        ,
                    </p>
                    <p className="text-muted-foreground pl-4">
                        <span className="text-foreground">&ldquo;availableEndpoints&ldquo;:</span>{' '}
                        <span className="text-primary">
                            [&ldquo;/&ldquo;, &ldquo;/text&ldquo;, &ldquo;/xml&ldquo;,
                            &ldquo;/csv&ldquo;]
                        </span>
                    </p>
                    <p className="text-muted-foreground">{`}`}</p>
                </div>
            </div>

            {/* Suggestions */}
            <ErrorSuggestions suggestions={suggestions} />

            {/* Actions */}
            <ErrorActions>
                <Button asChild variant="default" className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
                </Button>
            </ErrorActions>
        </ErrorPageLayout>
    );
}
