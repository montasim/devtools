'use client';

import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import ErrorLayout from '@/components/error-layout';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <ErrorLayout
            code="500"
            icon={AlertTriangle}
            color="destructive"
            heading="Well, that's embarrassing"
            description="Something broke on our end — not your fault. It happens to the best code. Give it another shot or head home."
            detail={error.message || undefined}
            primaryAction={{ label: 'Try again', icon: RotateCw, onClick: reset }}
            secondaryAction={{ label: 'Back to Home', icon: Home, href: '/' }}
            footerPrefix="Keeps happening?"
            feedbackSubject="500 – Internal server error"
        />
    );
}
