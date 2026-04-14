'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div
                    style={{
                        display: 'flex',
                        minHeight: '100vh',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '42rem',
                            textAlign: 'center',
                        }}
                    >
                        <h1
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '4rem',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                            }}
                        >
                            500
                        </h1>
                        <h2
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                            }}
                        >
                            Application Error
                        </h2>
                        <p
                            style={{
                                fontSize: '1.125rem',
                                color: '#6b7280',
                                marginBottom: '1rem',
                            }}
                        >
                            An unexpected error occurred. Please try again later.
                        </p>
                        {error.digest && (
                            <div
                                style={{
                                    borderRadius: '0.5rem',
                                    backgroundColor: '#f3f4f6',
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>Error ID:</span>{' '}
                                    <span>{error.digest}</span>
                                </p>
                            </div>
                        )}
                        <button
                            onClick={reset}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '0.5rem',
                                backgroundColor: '#000',
                                color: '#fff',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                border: 'none',
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
