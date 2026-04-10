import { LucideIcon, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvalidTabStateProps {
    invalidTab: string;
    icon?: LucideIcon;
    className?: string;
}

export function InvalidTabState({ invalidTab, icon: Icon, className }: InvalidTabStateProps) {
    const DefaultIcon = Icon || FileQuestion;

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center mt-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-8 py-16',
                className,
            )}
        >
            <DefaultIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tab Not Found
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
                The tab{' '}
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    &quot;{invalidTab}&quot;
                </span>{' '}
                doesn&apos;t exist or has been moved. Please select a tab from the menu above.
            </p>
        </div>
    );
}
