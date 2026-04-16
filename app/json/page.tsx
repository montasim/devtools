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
import {
    GitCompare,
    Code,
    Minimize2,
    FileJson,
    Share2,
    History,
    Eye,
    FileDown,
    Bookmark,
} from 'lucide-react';
import { JsonDiffTab as DiffTab } from '@/app/json/tabs/json-diff-tab';
import { JsonFormatTab as FormatTab } from '@/app/json/tabs/json-format-tab';
import { JsonMinifyTab as MinifyTab } from '@/app/json/tabs/json-minify-tab';
import { JsonViewerTab as ViewerTab } from '@/app/json/tabs/json-viewer-tab';
import { JsonParserTab as ParserTab } from '@/app/json/tabs/json-parser-tab';
import { JsonExportTab as ExportTab } from '@/app/json/tabs/json-export-tab';
import { JsonSchemaTab as SchemaTab } from '@/app/json/tabs/json-schema-tab';
import { JsonSavedTab as SavedTab } from '@/app/json/tabs/json-saved-tab';
import { JsonHistoryTab as HistoryTab } from '@/app/json/tabs/json-history-tab';
import { JsonShareTab as ShareTab } from '@/app/json/tabs/json-share-tab';
import { InvalidTabState } from '@/components/ui/invalid-tab-state';
import { SharedContentBanner } from '@/components/shared/shared-content-banner';

type TabValue = (typeof VALID_TABS)[number];

const VALID_TABS = [
    'diff',
    'format',
    'minify',
    'viewer',
    'parser',
    'export',
    'schema',
    'saved',
    'shared',
    'history',
] as const;

function JsonPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitializingRef = useRef(true);
    const previousTabRef = useRef<string | null>(null);
    const [sharedData, setSharedData] = useState<{
        title: string;
        comment?: string | null;
        expiresAt?: string | null;
        hasPassword: boolean;
        viewCount: number;
        createdAt: string;
        tabName: string;
        state?: {
            leftContent?: string;
            rightContent?: string;
        };
    } | null>(null);
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

    // Check for shared state on mount
    useEffect(() => {
        const sharedStateStr = sessionStorage.getItem('sharedState');
        if (sharedStateStr) {
            try {
                const sharedState = JSON.parse(sharedStateStr) as {
                    title: string;
                    comment?: string | null;
                    expiresAt?: string | null;
                    hasPassword: boolean;
                    viewCount: number;
                    createdAt: string;
                    tabName: string;
                };
                sessionStorage.removeItem('sharedState');

                // Switch to the shared tab
                const { tabName } = sharedState;
                const params = new URLSearchParams();
                params.set('tab', tabName);
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                // Set shared data and active tab after navigation
                setTimeout(() => {
                    setActiveTab(tabName as TabValue);
                    setSharedData(sharedState);
                }, 0);
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
                                        { value: 'format', label: 'Format', icon: Code },
                                        { value: 'minify', label: 'Minify', icon: Minimize2 },
                                        { value: 'viewer', label: 'Viewer', icon: Eye },
                                        { value: 'parser', label: 'Parser', icon: FileJson },
                                        { value: 'export', label: 'Export', icon: FileDown },
                                        { value: 'schema', label: 'Schema', icon: FileJson },
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
                    <SavedTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="shared" className="mt-0">
                    <ShareTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <HistoryTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="diff" className="mt-0">
                    <DiffTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="format" className="mt-0">
                    <FormatTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="minify" className="mt-0">
                    <MinifyTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="viewer" className="mt-0">
                    <ViewerTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="parser" className="mt-0">
                    <ParserTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="export" className="mt-0">
                    <ExportTab onClear={handleClear} sharedData={sharedData} />
                </TabsContent>

                <TabsContent value="schema" className="mt-0">
                    <SchemaTab onClear={handleClear} sharedData={sharedData} />
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
                <JsonPageContent />
            </Suspense>
        </div>
    );
}
