'use client';

import {
    useState,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
    Suspense,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitCompare, Sparkles, ArrowLeftRight, Share2, History, Bookmark } from 'lucide-react';
import { TextDiffTab } from '@/app/text/tabs/text-diff-tab';
import { TextConvertTab } from '@/app/text/tabs/text-convert-tab';
import { TextCleanTab } from '@/app/text/tabs/text-clean-tab';
import { TextSavedTab } from '@/app/text/tabs/text-saved-tab';
import { TextHistoryTab } from '@/app/text/tabs/text-history-tab';
import { TextSharedTab } from '@/app/text/tabs/text-shared-tab';
import { InvalidTabState } from '@/components/ui/invalid-tab-state';
import { SharedContentBanner } from '@/components/shared/shared-content-banner';

type TabValue = (typeof VALID_TABS)[number];

const VALID_TABS = ['diff', 'convert', 'clean', 'saved', 'shared', 'history'] as const;

function TextPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitializingRef = useRef(true);
    const previousTabRef = useRef<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabValue>(() => {
        // Initialize from URL during state creation
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            if (VALID_TABS.includes(tabFromUrl as TabValue)) {
                return tabFromUrl as TabValue;
            } else {
                // Return the invalid tab as the active tab so Tabs component shows it selected
                return tabFromUrl as TabValue;
            }
        }
        return 'diff';
    });

    // Derive invalidTab from URL params and activeTab
    const invalidTab: string | null = useMemo(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && !VALID_TABS.includes(tabFromUrl as TabValue)) {
            return tabFromUrl;
        }
        return null;
    }, [searchParams]);

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
                setTimeout(() => setActiveTab(tabName as TabValue), 0);
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
                if (VALID_TABS.includes(tabFromUrl as TabValue)) {
                    // Valid tab - track it
                    previousTabRef.current = tabFromUrl;
                }
            } else {
                // No tab specified - set default
                const params = new URLSearchParams();
                params.set('tab', activeTab);
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
            isInitializingRef.current = false;
        }
    }, [searchParams, pathname, router, activeTab]);

    const handleClear = () => {
        // Reload page to clear all content
        window.location.reload();
    };

    // Handle tab changes with URL update
    const handleTabChange = useCallback(
        (tab: string) => {
            const newTab = tab as TabValue;
            setActiveTab(newTab);
            previousTabRef.current = newTab;
            // Update URL without causing a page reload
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', newTab);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, pathname, router],
    );

    // Sync URL changes with state (for browser back/forward navigation)
    useEffect(() => {
        if (!isInitializingRef.current) {
            const currentTab = searchParams.get('tab');
            // Only update if the URL actually changed (not from our own updates)
            if (
                currentTab &&
                currentTab !== previousTabRef.current &&
                VALID_TABS.includes(currentTab as TabValue) &&
                currentTab !== activeTab
            ) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setActiveTab(currentTab as TabValue);
                previousTabRef.current = currentTab;
            }
        }
    }, [searchParams, activeTab]);

    return (
        <>
            {sharedData && (
                <SharedContentBanner
                    title={sharedData.title}
                    comment={sharedData.comment}
                    expiresAt={sharedData.expiresAt}
                    hasPassword={sharedData.hasPassword}
                    viewCount={sharedData.viewCount}
                    createdAt={sharedData.createdAt}
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
                                    {[
                                        { value: 'diff', label: 'Diff', icon: GitCompare },
                                        {
                                            value: 'convert',
                                            label: 'Convert',
                                            icon: ArrowLeftRight,
                                        },
                                        { value: 'clean', label: 'Clean', icon: Sparkles },
                                    ].map(({ value, label, icon: Icon }) => (
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
                                    {[
                                        { value: 'saved', label: 'Saved', icon: Bookmark },
                                        { value: 'shared', label: 'Shared', icon: Share2 },
                                        { value: 'history', label: 'History', icon: History },
                                    ].map(({ value, label, icon: Icon }) => (
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
                                <div className="flex md:hidden gap-2 min-w-max">
                                    {[
                                        { value: 'saved', label: 'Saved', icon: Bookmark },
                                        { value: 'shared', label: 'Shared', icon: Share2 },
                                        { value: 'history', label: 'History', icon: History },
                                    ].map(({ value, label, icon: Icon }) => (
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
                            </div>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="saved" className="mt-0">
                    <TextSavedTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="shared" className="mt-0">
                    <TextSharedTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <TextHistoryTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="diff" className="mt-0">
                    <TextDiffTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="convert" className="mt-0">
                    <TextConvertTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="clean" className="mt-0">
                    <TextCleanTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                {invalidTab && (
                    <TabsContent value={invalidTab} className="mt-0">
                        <InvalidTabState invalidTab={invalidTab} />
                    </TabsContent>
                )}
            </Tabs>
        </>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen" />}>
                <TextPageContent />
            </Suspense>
        </div>
    );
}
