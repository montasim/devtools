'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ShareError =
  | 'NOT_FOUND'
  | 'LINK_EXPIRED'
  | 'PASSWORD_REQUIRED'
  | 'INVALID_PASSWORD'
  | 'STATE_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INVALID_STATE';

interface ShareErrorDisplayProps {
  error: ShareError;
  pageType: string;
}

const errorConfig = {
  NOT_FOUND: {
    title: 'Share Link Not Found',
    message: 'This share link doesn\'t exist or has been deleted.',
    icon: AlertCircle,
  },
  LINK_EXPIRED: {
    title: 'Share Link Expired',
    message: 'This share link has expired and is no longer available.',
    icon: Clock,
  },
  PASSWORD_REQUIRED: {
    title: 'Password Required',
    message: 'This content is protected with a password.',
    icon: Lock,
  },
  INVALID_PASSWORD: {
    title: 'Incorrect Password',
    message: 'The password you entered is incorrect. Please try again.',
    icon: Lock,
  },
  STATE_TOO_LARGE: {
    title: 'Content Too Large',
    message: 'This content is too large to share (max 5MB).',
    icon: AlertTriangle,
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a while and try again.',
    icon: AlertTriangle,
  },
  INVALID_STATE: {
    title: 'Invalid Content',
    message: 'The shared content is invalid or corrupted.',
    icon: AlertCircle,
  },
};

export function ShareErrorDisplay({ error, pageType }: ShareErrorDisplayProps) {
  const config = errorConfig[error];
  const Icon = config.icon;
  const router = useRouter();

  const handleGoToPage = () => {
    router.push(`/${pageType}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center">
        <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
        <p className="text-muted-foreground mb-6">{config.message}</p>

        <Button onClick={handleGoToPage}>
          Go to {pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page
        </Button>
      </div>
    </div>
  );
}
