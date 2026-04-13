'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PasswordPrompt } from '@/components/shared/password-prompt';
import { ShareErrorDisplay } from '@/components/shared/share-error-display';

interface PageProps {
  params: Promise<{ pageType: string; id: string }>;
}

export default function SharedLinkPage({ params }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { pageType, id } = use(params);

  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSharedContent() {
      // Validate pageType (this is the URL param, e.g., 'json', 'text', 'base64')
      const validPageTypes = ['text', 'json', 'base64'];
      if (!validPageTypes.includes(pageType)) {
        router.push('/text');
        return;
      }

      try {
        // Fetch metadata
        const metadataRes = await fetch(`/api/share/${id}`);
        if (!metadataRes.ok) {
          if (metadataRes.status === 404) {
            setError('NOT_FOUND');
            return;
          }
          setError('INVALID_STATE');
          return;
        }

        const metadataData = await metadataRes.json();
        setMetadata(metadataData);

        // Check expiration
        if (metadataData.expiresAt && new Date(metadataData.expiresAt) < new Date()) {
          setError('LINK_EXPIRED');
          return;
        }

        // If not password protected, access content directly
        if (!metadataData.hasPassword) {
          await accessContent();
        }
      } catch (err) {
        console.error('Error loading share:', err);
        setError('INVALID_STATE');
      } finally {
        setLoading(false);
      }
    }

    loadSharedContent();
  }, [pageType, id]);

  async function accessContent(password?: string) {
    try {
      const accessRes = await fetch(`/api/share/${id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!accessRes.ok) {
        if (accessRes.status === 401) {
          return { error: 'INVALID_PASSWORD' };
        }
        setError('INVALID_STATE');
        return;
      }

      const accessData = await accessRes.json();

      // Store in sessionStorage
      sessionStorage.setItem('sharedState', JSON.stringify(accessData));

      // Redirect to correct page/tab
      const { pageName, tabName } = accessData;
      router.push(`/${pageName}?tab=${tabName}`);
    } catch (err) {
      console.error('Error accessing share:', err);
      setError('INVALID_STATE');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading shared content...</p>
      </div>
    );
  }

  if (error) {
    return <ShareErrorDisplay error={error} pageType={pageType} />;
  }

  if (metadata?.hasPassword) {
    return (
      <PasswordPrompt
        pageType={pageType}
        id={id}
        metadata={metadata}
        onUnlock={accessContent}
      />
    );
  }

  return null; // Will redirect
}
