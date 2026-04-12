import { useSyncExternalStore } from 'react';

/**
 * Custom hook to handle client-only rendering
 * Returns true only after the component has mounted on the client
 * Use this to prevent hydration mismatches when accessing browser APIs
 */
export function useClientOnly() {
    return useSyncExternalStore(
        // subscribe function - no-op since we only need to know if we're on client
        () => () => {},
        // getSnapshot on client - always return true
        () => true,
        // getSnapshot on server - return false
        () => false,
    );
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
            return fallback as React.ReactElement | null;
        }

        return <Component {...props} />;
    };
}
