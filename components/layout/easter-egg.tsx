'use client';

import { useState, useEffect, useCallback } from 'react';
import { useKonamiCode, useKonamiProgress } from '@/hooks/use-konami-code';
import { fireConfetti } from './confetti';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const RETRO_ASCII = [
    ' ██████╗ ███████╗███████╗██████╗  ██████╗ ███████╗',
    '██╔════╝ ██╔════╝██╔════╝██╔══██╗██╔═══██╗██╔════╝',
    '██║  ███╗█████╗  █████╗  ██████╔╝██║   ██║███████╗',
    '██║   ██║██╔══╝  ██╔══╝  ██╔══██╗██║   ██║╚════██║',
    '╚██████╔╝███████╗███████╗██║  ██║╚██████╔╝███████║',
    ' ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
];

const TIPS = [
    'You found the secret! Try pressing ↑↑↓↓←→←→BA on any page.',
    'Pro tip: ⌘K opens the command palette.',
    'Our tools run 100% in your browser — nothing leaves your machine.',
    'Star us on GitHub if you find this useful!',
    'The best code is no code. The second best is well-tested code.',
];

export function EasterEgg() {
    const [open, setOpen] = useState(false);
    const [tip, setTip] = useState('');
    const progress = useKonamiProgress();

    const activate = useCallback(() => {
        setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        setOpen(true);
        fireConfetti(4000);
    }, []);

    useKonamiCode(activate);

    useEffect(() => {
        if (!open) return;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes easter-glow {
                0%, 100% { text-shadow: 0 0 10px #7c3aed, 0 0 20px #7c3aed, 0 0 40px #6366f1; }
                50% { text-shadow: 0 0 5px #7c3aed, 0 0 10px #7c3aed, 0 0 20px #6366f1; }
            }
            .easter-ascii { animation: easter-glow 2s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, [open]);

    return (
        <>
            {progress > 0 && !open && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-200"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg bg-zinc-950 text-green-400 border-green-500/30 font-mono">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Easter Egg</DialogTitle>
                        <DialogDescription className="sr-only">
                            You found the secret easter egg!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-6 py-4">
                        <pre className="easter-ascii text-[10px] leading-tight text-green-400 sm:text-xs">
                            {RETRO_ASCII.join('\n')}
                        </pre>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

                        <div className="space-y-3 text-center">
                            <p className="text-lg font-bold text-green-300">
                                You found the secret!
                            </p>
                            <p className="text-sm text-green-400/80 max-w-sm">{tip}</p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                onClick={() => {
                                    fireConfetti(2000);
                                }}
                            >
                                More Confetti
                            </Button>
                            <Button
                                variant="outline"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                onClick={() => {
                                    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
                                }}
                            >
                                Another Tip
                            </Button>
                        </div>

                        <p className="text-[10px] text-green-500/40 tracking-widest uppercase">
                            ↑ ↑ ↓ ↓ ← → ← → B A
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
