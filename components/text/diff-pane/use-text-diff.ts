import { useMemo } from 'react';
import { diffLines } from 'diff';

export function useTextDiff(leftText: string, rightText: string) {
    return useMemo(() => {
        if (!leftText && !rightText) {
            return { diff: null, stats: null };
        }

        const diff = diffLines(leftText || '', rightText || '', {
            ignoreWhitespace: false,
            newlineIsToken: true,
        });

        const stats = {
            addedLines: diff
                .filter((part) => part.added)
                .reduce((acc, part) => acc + part.count, 0),
            removedLines: diff
                .filter((part) => part.removed)
                .reduce((acc, part) => acc + part.count, 0),
            unchangedLines: diff
                .filter((part) => !part.added && !part.removed)
                .reduce((acc, part) => acc + part.count, 0),
        };

        return { diff, stats };
    }, [leftText, rightText]);
}
