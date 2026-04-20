'use client';

import { use, useState } from 'react';
import { useShareMetadata, useShareAccess } from '@/features/sharing/hooks/use-share-api';
import { PasswordPrompt } from '@/features/sharing/components/password-prompt';
import { SharedContentBanner } from '@/features/sharing/components/shared-content-banner';
import { ShareErrorDisplay } from '@/features/sharing/components/share-error-display';
import { Loader2 } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { getToolDefinition } from '@/features/tools/core/config/tool-registry';

import '@/app/(tools)/json/page';
import '@/app/(tools)/text/page';
import '@/app/(tools)/base64/page';

export default function SharedContentPage({
    params,
}: {
    params: Promise<{ type: string; id: string }>;
}) {
    const { type, id } = use(params);
    const [password, setPassword] = useState<string | undefined>();
    const [passwordSubmitted, setPasswordSubmitted] = useState(false);

    const { data: metadata, isLoading: metaLoading, error: metaError } = useShareMetadata(id);
    const { data: accessData, isLoading: accessLoading } = useShareAccess(
        id,
        metadata?.hasPassword ? password : undefined,
        metadata?.hasPassword,
    );

    const handlePasswordSubmit = (pwd: string) => {
        setPassword(pwd);
        setPasswordSubmitted(true);
    };

    if (metaLoading || (metadata?.hasPassword && passwordSubmitted && accessLoading)) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (metaError || !metadata) {
        return <ShareErrorDisplay message="Failed to load shared content" />;
    }

    if (metadata.hasPassword && !passwordSubmitted) {
        return (
            <div className="mx-auto max-w-md py-12">
                <PasswordPrompt onSubmit={handlePasswordSubmit} isLoading={accessLoading} />
            </div>
        );
    }

    const toolDefinition = getToolDefinition(type);
    if (!toolDefinition) {
        return <ShareErrorDisplay message={`Unknown tool type: ${type}`} />;
    }

    const sharedData = accessData?.content
        ? { tabName: metadata.tabName, state: accessData.content.state }
        : null;

    return (
        <>
            <SharedContentBanner metadata={metadata} />
            <ToolPage definition={toolDefinition} sharedData={sharedData} />
        </>
    );
}
