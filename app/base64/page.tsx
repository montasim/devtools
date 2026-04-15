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
import { FileCode, Image as ImageIcon, Share2, History, Bookmark } from 'lucide-react';
import { MediaToBase64Tab } from '@/app/base64/tabs/media-to-base64-tab';
import { Base64ToMediaTab } from '@/app/base64/tabs/base64-to-media-tab';
import { Base64SavedTab } from '@/app/base64/tabs/base64-saved-tab';
import { Base64HistoryTab } from '@/app/base64/tabs/base64-history-tab';
import { Base64SharedTab } from '@/app/base64/tabs/base64-shared-tab';
import { InvalidTabState } from '@/components/ui/invalid-tab-state';
import { SharedContentBanner } from '@/components/shared/shared-content-banner';
import { BASE64_TABS } from '@/lib/constants/tabs';

type TabValue = (typeof VALID_TABS)[number];

const VALID_TABS = [
    BASE64_TABS.MEDIA_TO_BASE64,
    BASE64_TABS.BASE64_TO_MEDIA,
    'saved',
    'shared',
    'history',
] as const;

function Base64PageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitializingRef = useRef(true);
    const previousTabRef = useRef<string | null>(null);
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
    const [activeTab, setActiveTab] = useState<TabValue>(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            if (VALID_TABS.includes(tabFromUrl as TabValue)) {
                return tabFromUrl as TabValue;
            } else {
                return tabFromUrl as TabValue;
            }
        }
        return BASE64_TABS.MEDIA_TO_BASE64;
    });

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

    useLayoutEffect(() => {
        if (isInitializingRef.current) {
            const tabFromUrl = searchParams.get('tab');
            if (tabFromUrl) {
                if (VALID_TABS.includes(tabFromUrl as TabValue)) {
                    previousTabRef.current = tabFromUrl;
                }
            } else {
                const params = new URLSearchParams();
                params.set('tab', activeTab);
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
            isInitializingRef.current = false;
        }
    }, [searchParams, pathname, router, activeTab]);

    const handleClear = () => {
        window.location.reload();
    };

    const handleTabChange = useCallback(
        (tab: string) => {
            const newTab = tab as TabValue;
            setActiveTab(newTab);
            previousTabRef.current = newTab;
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', newTab);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, pathname, router],
    );

    useEffect(() => {
        if (!isInitializingRef.current) {
            const currentTab = searchParams.get('tab');
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
                                    {[
                                        {
                                            value: BASE64_TABS.MEDIA_TO_BASE64,
                                            label: 'Media to Base64',
                                            icon: FileCode,
                                        },
                                        {
                                            value: BASE64_TABS.BASE64_TO_MEDIA,
                                            label: 'Base64 to Media',
                                            icon: ImageIcon,
                                        },
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
                    <Base64SavedTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="shared" className="mt-0">
                    <Base64SharedTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <Base64HistoryTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value={BASE64_TABS.MEDIA_TO_BASE64} className="mt-0">
                    <MediaToBase64Tab
                        onClear={handleClear}
                        sharedData={sharedData ? {
                            tabName: sharedData.tabName,
                            state: sharedData.state,
                        } : undefined}
                    />
                </TabsContent>

                <TabsContent value={BASE64_TABS.BASE64_TO_MEDIA} className="mt-0">
                    <Base64ToMediaTab
                        onClear={handleClear}
                        sharedData={sharedData ? {
                            tabName: sharedData.tabName,
                            state: sharedData.state,
                        } : undefined}
                    />
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

export default function Base64Page() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen" />}>
                <Base64PageContent />
            </Suspense>
        </div>
    );
}
