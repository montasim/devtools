'use client';

import { ConvertPane } from '@/components/text/convert-pane/convert-pane';

export interface TextConvertTabProps {
    onClear?: () => void;
}

export function TextConvertTab({ onClear }: TextConvertTabProps) {
    return <ConvertPane />;
}
