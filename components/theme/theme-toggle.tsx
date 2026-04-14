'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for next-themes hydration pattern
        setMounted(true);
    }, []);

    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const getThemeIcon = () => {
        if (theme === 'system') {
            return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
        }
        return resolvedTheme === 'dark' ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
        );
    };

    const getThemeLabel = () => {
        if (theme === 'system') {
            return `System (${resolvedTheme})`;
        }
        return (theme || 'system').charAt(0).toUpperCase() + (theme || 'system').slice(1);
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Button
                size="icon"
                variant="outline"
                aria-label="Loading theme toggle"
                className="opacity-0"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    onClick={cycleTheme}
                    aria-label={`Current theme: ${getThemeLabel()}. Click to cycle through themes.`}
                >
                    {getThemeIcon()}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Current theme: {getThemeLabel()}</p>
            </TooltipContent>
        </Tooltip>
    );
}
