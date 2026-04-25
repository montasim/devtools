'use client';

import { useEffect } from 'react';

export function ConsoleBanner() {
    useEffect(() => {
        const bannerStyle = [
            'color: #7c3aed',
            'font-size: 12px',
            'font-weight: bold',
            'line-height: 1.3',
        ].join(';');

        const ascii = [
            '',
            '    ____       __       ____',
            '   / __ \\___  / /_____ / __/',
            '  / / / / _ \\/ __/ __ \\/ /_  ',
            ' / /_/ /  __/ /_/ /_/ / __/  ',
            '/_____/\\___/\\__/\\____/_/     ',
            '',
        ].join('\n');

        console.log(`%c${ascii}`, bannerStyle);

        console.log('%cHello!', 'color: #7c3aed; font-size: 16px; font-weight: bold;');

        const linkStyle = 'color: #6366f1; font-size: 13px;';

        console.log('%c- Open Source  https://github.com/montasim/devtools', linkStyle);
        console.log('%c- Website      https://devtoolsn.vercel.app', linkStyle);
        console.log('%c- Feedback     montasimmamun@gmail.com', linkStyle);
    }, []);

    return null;
}
