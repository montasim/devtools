'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, ReactNode, useMemo } from 'react';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent,
    ContextMenuLabel,
} from '@/components/ui/context-menu';
import { navigationMenu } from '@/config/navigation';
import { useToolActionsContext } from '@/features/tools/core/context/tool-actions-context';
import { Bookmark, Share2, History, ArrowLeft, ArrowRight, RotateCw, Wrench } from 'lucide-react';

interface ToolEntry {
    title: string;
    url: string;
    icon?: ReactNode;
    category?: string;
}

export function AppContextMenu({ children }: { children: ReactNode }) {
    return (
        <Suspense>
            <AppContextMenuInner>{children}</AppContextMenuInner>
        </Suspense>
    );
}

function AppContextMenuInner({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { save, share } = useToolActionsContext();

    const isToolPage = useMemo(() => {
        const toolsItem = navigationMenu.find((item) => item.title === 'Tools');
        return toolsItem?.items?.some((t) => t.url === pathname) ?? false;
    }, [pathname]);

    const tools = useMemo(() => {
        const toolsItem = navigationMenu.find((item) => item.title === 'Tools');
        return (toolsItem?.items ?? []) as ToolEntry[];
    }, []);

    const categories = useMemo(() => {
        const map = new Map<string, ToolEntry[]>();
        for (const tool of tools) {
            const cat = tool.category ?? 'Other';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(tool);
        }
        return map;
    }, [tools]);

    const handleBack = () => router.back();
    const handleForward = () => window.history.forward();
    const handleReload = () => window.location.reload();

    const handleHistory = () => {
        if (isToolPage) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', 'history');
            router.push(`${pathname}?${params.toString()}`);
        } else {
            router.push('/share/text');
        }
    };

    const itemClass = 'focus:bg-primary/10 focus:text-primary [&_span]:focus:text-primary';
    const activeToolClass = 'bg-primary/10 text-primary focus:bg-primary/15';
    const subTriggerClass =
        'focus:bg-primary/10 focus:text-primary data-open:bg-primary/10 data-open:text-primary';

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className="contents">{children}</div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuGroup>
                    <ContextMenuItem
                        onClick={save ?? undefined}
                        disabled={!save}
                        className={itemClass}
                    >
                        <Bookmark className="size-4" />
                        Save
                        <ContextMenuShortcut>⌘S</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={share ?? undefined}
                        disabled={!share}
                        className={itemClass}
                    >
                        <Share2 className="size-4" />
                        Share
                        <ContextMenuShortcut>⌘⇧S</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleHistory} className={itemClass}>
                        <History className="size-4" />
                        History
                    </ContextMenuItem>
                </ContextMenuGroup>

                <ContextMenuSeparator />

                <ContextMenuGroup>
                    <ContextMenuItem onClick={handleBack} className={itemClass}>
                        <ArrowLeft className="size-4" />
                        Back
                        <ContextMenuShortcut>⌘←</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleForward} className={itemClass}>
                        <ArrowRight className="size-4" />
                        Forward
                        <ContextMenuShortcut>⌘→</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleReload} className={itemClass}>
                        <RotateCw className="size-4" />
                        Reload
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuGroup>

                <ContextMenuSeparator />

                <ContextMenuGroup>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className={subTriggerClass}>
                            <Wrench className="size-4" />
                            Tools
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="max-h-[400px] overflow-y-auto w-64">
                            {Array.from(categories.entries()).map(([category, categoryTools]) => (
                                <ContextMenuGroup key={category}>
                                    <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
                                        {category}
                                    </ContextMenuLabel>
                                    {categoryTools.map((tool) => (
                                        <ContextMenuItem
                                            key={tool.url}
                                            onClick={() => router.push(tool.url)}
                                            className={
                                                pathname === tool.url ? activeToolClass : itemClass
                                            }
                                        >
                                            {tool.icon}
                                            {tool.title}
                                        </ContextMenuItem>
                                    ))}
                                    <ContextMenuSeparator />
                                </ContextMenuGroup>
                            ))}
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    );
}
