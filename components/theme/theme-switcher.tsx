'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
] as const;

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="inline-flex items-center justify-center p-1 bg-muted rounded-full">
            {themes.map((themeOption) => {
                const isActive = theme === themeOption.name;
                const Icon = themeOption.icon;

                return (
                    <Button
                        key={themeOption.name}
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(themeOption.name)}
                        className={cn(
                            'relative inline-flex items-center justify-center p-1.5 rounded-full transition-all duration-200 h-8 w-8',
                            isActive
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                        aria-label={`Switch to ${themeOption.label} theme`}
                        aria-pressed={isActive}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                );
            })}
        </div>
    );
}
