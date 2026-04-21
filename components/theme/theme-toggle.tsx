'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/lib/hooks/use-mounted';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();

    if (!mounted) return <Button variant="ghost" size="icon" className="h-9 w-9" />;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
