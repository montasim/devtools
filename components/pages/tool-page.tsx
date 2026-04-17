'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvalidTabState } from '@/components/ui/invalid-tab-state';
import { SharedContentBanner } from '@/components/shared/shared-content-banner';
import { ToolConfig, SHARED_TABS } from '@/lib/config/tools';

interface ToolPageProps {
    config: ToolConfig;
    components: Record<string, React.ComponentType<Record<string, unknown>>>;
}

export function ToolPage({ config, components }: ToolPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitializingRef = useRef(true);
    const previousTabRef = useRef<string | null>(null);

    // Combine main tabs with shared tabs for validation (memoized to avoid dependency issues)
    const allTabValues = useMemo(
        () => [
            ...config.mainTabs.map((tab) => tab.value),
            SHARED_TABS.SAVED.value,
            SHARED_TABS.SHARED.value,
            SHARED_TABS.HISTORY.value,
        ],
        [config.mainTabs],
    );

    const [activeTab, setActiveTab] = useState<string>(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            if (allTabValues.includes(tabFromUrl)) {
                return tabFromUrl;
            } else {
                return tabFromUrl; // Return invalid tab to show error state
            }
        }
        return config.defaultTab;
    });

    // Derive invalidTab from URL params and activeTab
    const invalidTab: string | null = useMemo(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && !allTabValues.includes(tabFromUrl)) {
            return tabFromUrl;
        }
        return null;
    }, [searchParams, allTabValues]);

    // Shared content state
    const [sharedData, setSharedData] = useState<{
        tabName?: string;
        state?: {
            leftContent?: string;
            rightContent?: string;
        };
        title?: string;
        comment?: string;
        expiresAt?: string;
        hasPassword?: boolean;
        viewCount?: number;
        createdAt?: string;
    } | null>(null);

    // Check for shared state on mount
    useEffect(() => {
        const sharedStateStr = sessionStorage.getItem('sharedState');
        if (sharedStateStr) {
            try {
                const sharedState = JSON.parse(sharedStateStr);
                setTimeout(() => setSharedData(sharedState), 0);
                sessionStorage.removeItem('sharedState');

                // Switch to the shared tab
                const { tabName } = sharedState;
                setTimeout(() => setActiveTab(tabName), 0);
                const params = new URLSearchParams();
                params.set('tab', tabName);
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            } catch (error) {
                console.error('Failed to parse shared state:', error);
                sessionStorage.removeItem('sharedState');
            }
        }
    }, [pathname, router]);

    // Set default URL on mount if needed
    useLayoutEffect(() => {
        if (isInitializingRef.current) {
            const tabFromUrl = searchParams.get('tab');
            if (tabFromUrl) {
                if (allTabValues.includes(tabFromUrl)) {
                    previousTabRef.current = tabFromUrl;
                }
            } else {
                const params = new URLSearchParams();
                params.set('tab', activeTab);
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
            isInitializingRef.current = false;
        }
    }, [searchParams, pathname, router, activeTab, allTabValues]);

    const handleClear = () => {
        window.location.reload();
    };

    // Handle tab changes with URL update
    const handleTabChange = useCallback(
        (tab: string) => {
            setActiveTab(tab);
            previousTabRef.current = tab;

            // Hide shared content banner when switching tabs
            if (sharedData) {
                setSharedData(null);
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', tab);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, pathname, router, sharedData],
    );

    // Handle content changes - hide shared banner when user edits content
    const handleContentChange = useCallback(() => {
        if (sharedData) {
            setSharedData(null);
        }
    }, [sharedData]);

    // Sync URL changes with state (for browser back/forward navigation)
    useEffect(() => {
        if (!isInitializingRef.current) {
            const currentTab = searchParams.get('tab');
            if (
                currentTab &&
                currentTab !== previousTabRef.current &&
                allTabValues.includes(currentTab) &&
                currentTab !== activeTab
            ) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setActiveTab(currentTab);
                previousTabRef.current = currentTab;
            }
        }
    }, [searchParams, activeTab, allTabValues]);

    return (
        <>
            {sharedData && (
                <SharedContentBanner
                    title={sharedData.title || 'Shared Content'}
                    comment={sharedData.comment}
                    expiresAt={sharedData.expiresAt}
                    hasPassword={sharedData.hasPassword ?? false}
                    viewCount={sharedData.viewCount ?? 0}
                    createdAt={sharedData.createdAt || new Date().toISOString()}
                    onClose={() => setSharedData(null)}
                />
            )}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="border-b">
                    <div className="mx-auto py-4">
                        <TabsList
                            variant="line"
                            className="h-auto p-0 bg-transparent border-0 w-full justify-start overflow-x-auto scrollbar-hide"
                        >
                            <div className="flex gap-2 min-w-max w-full justify-between">
                                <div className="flex gap-2 min-w-max">
                                    {config.mainTabs.map(({ value, label, icon: Icon }) => (
                                        <TabsTrigger
                                            key={value}
                                            value={value}
                                            className="gap-2 data-[icon=true]:pr-4 whitespace-nowrap"
                                        >
                                            <Icon data-icon="true" className="w-4 h-4 shrink-0" />
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </div>
                                <div className="hidden md:flex gap-2 min-w-max">
                                    {Object.values(SHARED_TABS).map(
                                        ({ value, label, icon: Icon }) => (
                                            <TabsTrigger
                                                key={value}
                                                value={value}
                                                className="gap-2 data-[icon=true]:pr-4 whitespace-nowrap"
                                            >
                                                <Icon
                                                    data-icon="true"
                                                    className="w-4 h-4 shrink-0"
                                                />
                                                {label}
                                            </TabsTrigger>
                                        ),
                                    )}
                                </div>
                                <div className="flex md:hidden gap-2 min-w-max">
                                    {Object.values(SHARED_TABS).map(
                                        ({ value, label, icon: Icon }) => (
                                            <TabsTrigger
                                                key={value}
                                                value={value}
                                                className="gap-2 data-[icon=true]:pr-4 whitespace-nowrap"
                                            >
                                                <Icon
                                                    data-icon="true"
                                                    className="w-4 h-4 shrink-0"
                                                />
                                                {label}
                                            </TabsTrigger>
                                        ),
                                    )}
                                </div>
                            </div>
                        </TabsList>
                    </div>
                </div>

                {/* Render shared tabs */}
                {Object.values(SHARED_TABS).map(({ value }) => {
                    const Component = components[value];
                    if (!Component) return null;
                    return (
                        <TabsContent key={value} value={value} className="mt-0">
                            <Component onTabChange={handleTabChange} />
                        </TabsContent>
                    );
                })}

                {/* Render main tabs */}
                {config.mainTabs.map(({ value }) => {
                    const Component = components[value];
                    if (!Component) return null;
                    return (
                        <TabsContent key={value} value={value} className="mt-0">
                            <Component
                                onClear={handleClear}
                                sharedData={sharedData}
                                onContentChange={handleContentChange}
                            />
                        </TabsContent>
                    );
                })}

                {invalidTab && (
                    <TabsContent value={invalidTab} className="mt-0">
                        <InvalidTabState invalidTab={invalidTab} />
                    </TabsContent>
                )}
            </Tabs>
        </>
    );
}
