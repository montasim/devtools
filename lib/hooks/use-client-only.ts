import { useEffect, useState } from 'react';

/**
 * Custom hook to handle client-only rendering
 * Returns true only after the component has mounted on the client
 * Use this to prevent hydration mismatches when accessing browser APIs
 */
export function useClientOnly() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

/**
 * HOC to prevent server-side rendering
 * Use this for components that must only render on the client
 */
export function withClientOnly<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode,
) {
    return function ClientOnlyWrapper(props: P) {
        const isClient = useClientOnly();

        if (!isClient) {
            return <>{fallback || null}</>;
        }

        return <Component {...props} />;
    };
}
