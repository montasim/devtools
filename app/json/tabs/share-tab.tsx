'use client';

export function ShareTab() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Share JSON</h2>
                <p className="text-muted-foreground mb-6">
                    Share your JSON data with others through shareable links and collaborative
                    features.
                </p>
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Generate Share Link</h3>
                        <p className="text-sm text-muted-foreground">
                            Coming soon: Create a unique shareable link for your JSON data.
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Export Options</h3>
                        <p className="text-sm text-muted-foreground">
                            Coming soon: Export JSON to various formats (JSON, CSV, XML, YAML).
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Collaborative Editing</h3>
                        <p className="text-sm text-muted-foreground">
                            Coming soon: Real-time collaboration features for JSON editing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
