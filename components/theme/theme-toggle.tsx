'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();

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
