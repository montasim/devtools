'use client';

import { Toolbar } from '@/components/toolbar/toolbar';

export function OptionsTab() {
    return (
        <>
            <Toolbar leftContent={<h2 className="text-lg font-semibold">Options</h2>} />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl">
                    <p className="text-muted-foreground mb-6">
                        Configure default settings for JSON operations across all tools.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">Diff Options</h3>
                            <p className="text-sm text-muted-foreground">
                                Configure how JSON differences are computed and displayed.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">Format Options</h3>
                            <p className="text-sm text-muted-foreground">
                                Set indentation preferences and formatting rules.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">Minify Options</h3>
                            <p className="text-sm text-muted-foreground">
                                Configure JSON compression and minification settings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
