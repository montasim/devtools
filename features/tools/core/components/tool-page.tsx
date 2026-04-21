'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { ToolDefinition, SharedData } from '../types/tool';
import { Bookmark, Clock, Globe } from 'lucide-react';

interface ToolPageProps {
    definition: ToolDefinition;
    sharedData?: SharedData | null;
}

const tabTriggerClass =
    'gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-primary/10';

function ToolPageInner({ definition, sharedData }: ToolPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { mainTabs, plugins } = definition;

    const pluginTabs = [
        ...(plugins.saved
            ? [
                  {
                      id: 'saved',
                      label: 'Saved',
                      icon: Bookmark,
                      component: plugins.saved,
                      isPlugin: true,
                  },
              ]
            : []),
        ...(plugins.shared
            ? [
                  {
                      id: 'shared',
                      label: 'Shared',
                      icon: Globe,
                      component: plugins.shared,
                      isPlugin: true,
                  },
              ]
            : []),
        ...(plugins.history
            ? [
                  {
                      id: 'history',
                      label: 'History',
                      icon: Clock,
                      component: plugins.history,
                      isPlugin: true,
                  },
              ]
            : []),
    ];

    const mainTabItems = mainTabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        icon: tab.icon,
        component: tab.component,
        isPlugin: false,
    }));

    const allTabIds = [...mainTabItems, ...pluginTabs].map((t) => t.id);
    const tabParam = searchParams.get('tab');
    const activeTab = tabParam && allTabIds.includes(tabParam) ? tabParam : definition.defaultTab;

    const setActiveTab = useCallback(
        (tab: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (tab === definition.defaultTab) {
                params.delete('tab');
            } else {
                params.set('tab', tab);
            }
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [searchParams, router, pathname, definition.defaultTab],
    );

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
                <div className="mx-auto py-2">
                    <TabsList
                        variant="line"
                        className="h-auto w-full justify-start overflow-x-auto border-0 bg-transparent p-0 scrollbar-hide"
                    >
                        <div className="flex w-full min-w-max justify-between gap-2">
                            <div className="flex min-w-max gap-1">
                                {mainTabItems.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={tabTriggerClass}
                                    >
                                        <tab.icon className="h-4 w-4 shrink-0" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </div>
                            <div className="flex min-w-max gap-1">
                                {pluginTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={tabTriggerClass}
                                    >
                                        <tab.icon className="h-4 w-4 shrink-0" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </TabsTrigger>
                                ))}
                            </div>
                        </div>
                    </TabsList>
                </div>
            </div>
            <div className="mx-auto">
                {mainTabItems.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                        <tab.component sharedData={sharedData} readOnly={!!sharedData} />
                    </TabsContent>
                ))}
                {pluginTabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                        <tab.component onTabChange={setActiveTab} />
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
}

export function ToolPage(props: ToolPageProps) {
    return (
        <Suspense>
            <ToolPageInner {...props} />
        </Suspense>
    );
}
