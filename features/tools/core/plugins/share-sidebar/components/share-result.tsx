'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useClipboard } from '@/lib/hooks/use-clipboard';

interface ShareResultProps {
    url: string;
}

export function ShareResult({ url }: ShareResultProps) {
    const { copy } = useClipboard();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copy(url, 'Share link copied to clipboard!');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <Input value={url} readOnly className="font-mono text-sm" />
            <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
                {copied ? (
                    <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
