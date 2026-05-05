import { ImageResponse } from 'next/og';
import { DevLogo } from '@/lib/og/dev-logo';

export const alt = 'DevTools - Free Developer Tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a',
                color: '#fafafa',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <div style={{ marginBottom: 32 }}>
                <DevLogo size={120} color="#ffffff" />
            </div>

            <div
                style={{
                    fontSize: 64,
                    fontWeight: 700,
                    letterSpacing: -2,
                    marginBottom: 16,
                }}
            >
                DevTools
            </div>

            <div
                style={{
                    fontSize: 28,
                    color: '#a1a1aa',
                    maxWidth: 600,
                    textAlign: 'center',
                }}
            >
                30+ free developer tools that run in your browser
            </div>
        </div>,
        {
            ...size,
        },
    );
}
