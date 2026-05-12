import { Home, Terminal, Braces } from 'lucide-react';
import ErrorLayout from '@/components/error-layout';

export default function NotFound() {
    return (
        <ErrorLayout
            code="404"
            icon={Terminal}
            heading="Lost in the void"
            description="Even the best developers hit dead ends. This page moved, got renamed, or never existed. Let's get you back to building."
            primaryAction={{ label: 'Back to Home', icon: Home, href: '/' }}
            secondaryAction={{ label: 'Browse Tools', icon: Braces, href: '/docs' }}
            footerPrefix="Think this is a mistake?"
            feedbackSubject="404 – Page not found"
        />
    );
}
