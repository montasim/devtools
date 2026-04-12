'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/components/theme/theme-provider';

export function ThemeToggle() {
    const { theme, setTheme, effectiveTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Only render theme-dependent UI after client-side hydration
    useEffect(() => {
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
        return effectiveTheme === 'dark' ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
        );
    };

    const getThemeLabel = () => {
        if (theme === 'system') {
            return `System (${effectiveTheme})`;
        }
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    };

    // Don't render theme-dependent UI until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <Button
                size="icon"
                variant="outline"
                className="opacity-0"
                aria-label="Loading theme toggle"
            />
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
