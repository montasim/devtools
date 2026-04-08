"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPageLayout } from "@/components/error-pages/error-page-layout";
import { ErrorCodeDisplay } from "@/components/error-pages/error-code-display";
import { ErrorActions } from "@/components/error-pages/error-actions";
import { ErrorSuggestions } from "@/components/error-pages/error-suggestions";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Application error:", error);
  }, [error]);

  const suggestions = [
    "Try refreshing the page",
    "Check your browser console for details",
    "Return to the homepage",
    `Report this error with ID: <span class="font-mono text-primary">${error.digest || "unknown"}</span>`,
  ];

  return (
    <ErrorPageLayout>
      <ErrorCodeDisplay
        code="500"
        icon={AlertTriangle}
        title="Internal Server Error"
        description="Something broke in the DevTools engine. Our team has been notified."
        errorId={error.digest}
      />

      {/* Terminal Display */}
      <div className="rounded-lg bg-muted p-4 text-left font-mono text-sm sm:text-base">
        <div className="space-y-1">
          <p className="text-muted-foreground">
            <span className="text-primary">$</span> npm run dev
          </p>
          <p className="text-muted-foreground">
            <span className="text-primary">&gt;</span> devtools@0.1.0 dev
          </p>
          <p className="text-muted-foreground">
            <span className="text-primary">&gt;</span> next dev
          </p>
          <p className="mt-2 text-destructive">ERROR: Unexpected runtime exception</p>
          <p className="text-muted-foreground">
            at DevToolComponent (
            <span className="text-foreground">/app/components/tool.tsx:42:15</span>)
          </p>
          <p className="text-muted-foreground">
            at processTicksAndRejections (
            <span className="text-foreground">node:internal/process/task_queues:95:5</span>)
          </p>
          {error.digest && (
            <>
              <p className="mt-2 text-muted-foreground">Error ID: {error.digest}</p>
              <p className="text-muted-foreground">
                Report:{" "}
                <a
                  href={`https://github.com/devtools/issues/new?error=${error.digest}`}
                  className="text-primary hover:underline"
                >
                  https://github.com/devtools/issues/new
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <ErrorSuggestions suggestions={suggestions} />

      {/* Actions */}
      <ErrorActions>
        <Button onClick={unstable_retry} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </ErrorActions>
    </ErrorPageLayout>
  );
}