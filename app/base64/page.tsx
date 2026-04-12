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
import { Settings, FileCode, Image as ImageIcon, Share2, History } from 'lucide-react';
import { MediaToBase64Tab } from '@/app/base64/tabs/media-to-base64-tab';
import { Base64ToMediaTab } from '@/app/base64/tabs/base64-to-media-tab';
import { OptionsTab } from '@/app/json/tabs/options-tab';
import { HistoryTab } from '@/app/json/tabs/history-tab';
import { ShareTab } from '@/app/json/tabs/share-tab';
import { InvalidTabState } from '@/components/ui/invalid-tab-state';

type TabValue = (typeof VALID_TABS)[number];

const VALID_TABS = ['encode', 'image', 'options', 'shared', 'history'] as const;

function Base64PageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isInitializingRef = useRef(true);
    const previousTabRef = useRef<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabValue>(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            if (VALID_TABS.includes(tabFromUrl as TabValue)) {
                return tabFromUrl as TabValue;
            } else {
                return tabFromUrl as TabValue;
            }
        }
        return 'encode';
    });

    const invalidTab: string | null = useMemo(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && !VALID_TABS.includes(tabFromUrl as TabValue)) {
            return tabFromUrl;
        }
        return null;
    }, [searchParams]);

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
                                            value: 'encode',
                                            label: 'Media to Base64',
                                            icon: FileCode,
                                        },
                                        {
                                            value: 'image',
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
                                        { value: 'options', label: 'Options', icon: Settings },
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
                                        { value: 'options', label: 'Options', icon: Settings },
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

                <TabsContent value="options" className="mt-0">
                    <OptionsTab />
                </TabsContent>

                <TabsContent value="shared" className="mt-0">
                    <ShareTab />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <HistoryTab onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="encode" className="mt-0">
                    <MediaToBase64Tab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="image" className="mt-0">
                    <Base64ToMediaTab onClear={handleClear} />
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
