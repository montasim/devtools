'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings,
    GitCompare,
    Code,
    Minimize2,
    FileJson,
    Share2,
    History,
    Eye,
    FileDown,
} from 'lucide-react';
import { DiffTab } from './tabs/diff-tab';
import { FormatTab } from './tabs/format-tab';
import { MinifyTab } from './tabs/minify-tab';
import { ViewerTab } from './tabs/viewer-tab';
import { ParserTab } from './tabs/parser-tab';
import { ExportTab } from './tabs/export-tab';
import { SchemaTab } from './tabs/schema-tab';
import { OptionsTab } from './tabs/options-tab';
import { HistoryTab } from './tabs/history-tab';
import { ShareTab } from './tabs/share-tab';

export default function Home() {
    const [activeTab, setActiveTab] = useState('diff');

    const handleClear = () => {
        // Reload page to clear all content
        window.location.reload();
    };

    // Handle tab changes with history loading
    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
    }, []);

    return (
        <div className="min-h-screen">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="border-b">
                    <div className="mx-auto py-4">
                        <TabsList
                            variant="line"
                            className="h-auto p-0 bg-transparent border-0 w-full justify-between"
                        >
                            <div className="flex gap-2">
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
                                        className="gap-2 data-[icon=true]:pr-4"
                                    >
                                        <Icon data-icon="true" className="w-4 h-4" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { value: 'options', label: 'Options', icon: Settings },
                                    { value: 'shared', label: 'Shared', icon: Share2 },
                                    { value: 'history', label: 'History', icon: History },
                                ].map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="gap-2 data-[icon=true]:pr-4"
                                    >
                                        <Icon data-icon="true" className="w-4 h-4" />
                                        {label}
                                    </TabsTrigger>
                                ))}
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

                <TabsContent value="diff" className="mt-0">
                    <DiffTab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="format" className="mt-0">
                    <FormatTab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="minify" className="mt-0">
                    <MinifyTab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="viewer" className="mt-0">
                    <ViewerTab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="parser" className="mt-0">
                    <ParserTab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="export" className="mt-0">
                    <ExportTab onClear={handleClear} />
                </TabsContent>

                <TabsContent value="schema" className="mt-0">
                    <SchemaTab onClear={handleClear} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
