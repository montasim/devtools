'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useToolState } from '../../core/hooks/use-tool-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useWebSocket, type WsMessage, type WsStatus } from '../hooks/use-websocket';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import type { TabComponentProps } from '../../core/types/tool';
import {
    Plug,
    Unplug,
    Send,
    ArrowUp,
    ArrowDown,
    Trash2,
    Copy,
    Loader2,
    AlertCircle,
    Zap,
} from 'lucide-react';

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusVariant(status: WsStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'connected':
            return 'default';
        case 'connecting':
            return 'secondary';
        case 'error':
            return 'destructive';
        case 'disconnected':
            return 'outline';
    }
}

function getStatusLabel(status: WsStatus): string {
    switch (status) {
        case 'connected':
            return 'Connected';
        case 'connecting':
            return 'Connecting...';
        case 'error':
            return 'Error';
        case 'disconnected':
            return 'Disconnected';
    }
}

function getStatusDotClass(status: WsStatus): string {
    switch (status) {
        case 'connected':
            return 'bg-green-500';
        case 'connecting':
            return 'bg-yellow-500 animate-pulse';
        case 'error':
            return 'bg-red-500';
        case 'disconnected':
            return 'bg-gray-400';
    }
}

function MessageBubble({ message }: { message: WsMessage }) {
    const { copy } = useClipboard();
    const isSent = message.direction === 'sent';

    let displayData = message.data;
    try {
        const parsed = JSON.parse(message.data);
        displayData = JSON.stringify(parsed, null, 2);
    } catch {}

    return (
        <div className={`flex gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isSent
                        ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                }`}
            >
                {isSent ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </div>
            <div
                className={`group relative max-w-[80%] rounded-lg border px-3 py-2 ${
                    isSent ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'
                }`}
            >
                <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {isSent ? 'Sent' : 'Received'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {formatTime(message.timestamp)}
                    </span>
                </div>
                <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                    {displayData}
                </pre>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                        {formatSize(message.size)}
                    </span>
                    <button
                        onClick={() => copy(message.data)}
                        className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TesterTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.WEBSOCKET_TESTER_URL,
        sharedData,
        tabId: 'tester',
        readOnly,
    });

    const { status, messages, connect, disconnect, send, clearMessages } = useWebSocket();
    const [inputMessage, setInputMessage] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { copy } = useClipboard();

    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    const wsUrl = useMemo(() => {
        if (!content) return '';
        try {
            const parsed = JSON.parse(content);
            return parsed.url || '';
        } catch {
            return content;
        }
    }, [content]);

    const handleConnect = useCallback(() => {
        if (!wsUrl.trim()) return;
        connect(wsUrl.trim());
    }, [wsUrl, connect]);

    const handleDisconnect = useCallback(() => {
        disconnect();
    }, [disconnect]);

    const handleSend = useCallback(() => {
        if (!inputMessage.trim()) return;
        const sent = send(inputMessage);
        if (sent) setInputMessage('');
    }, [inputMessage, send]);

    const handleCopyAll = useCallback(() => {
        const text = messages
            .map(
                (m) =>
                    `[${formatTime(m.timestamp)}] ${m.direction === 'sent' ? '>>>' : '<<<'} ${m.data}`,
            )
            .join('\n');
        copy(text);
    }, [messages, copy]);

    const { actions } = useToolActions({
        pageName: 'websocket',
        tabId: 'tester',
        getContent: () => content,
        onClear: () => {
            setContent('');
            clearMessages();
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return null;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex gap-2">
                    <Input
                        value={wsUrl}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="wss://echo.websocket.org or ws://localhost:8080"
                        className="h-9 font-mono text-sm"
                        spellCheck={false}
                        disabled={isConnected || isConnecting}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isConnected) handleConnect();
                        }}
                    />
                    {isConnected ? (
                        <Button
                            onClick={handleDisconnect}
                            variant="destructive"
                            size="sm"
                            className="h-9 px-4 gap-1.5"
                        >
                            <Unplug className="h-4 w-4" />
                            Disconnect
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            disabled={!wsUrl.trim() || isConnecting}
                            size="sm"
                            className="h-9 px-4 gap-1.5"
                        >
                            {isConnecting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plug className="h-4 w-4" />
                            )}
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${getStatusDotClass(status)}`}
                        />
                        <Badge variant={getStatusVariant(status)} className="text-[10px]">
                            {getStatusLabel(status)}
                        </Badge>
                    </div>
                    {messages.length > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">
                                {messages.length} message{messages.length !== 1 ? 's' : ''}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={handleCopyAll}
                                title="Copy all messages"
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={clearMessages}
                                title="Clear messages"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-lg border bg-muted/20 p-4 md:min-h-[400px] lg:min-h-[500px]">
                    {messages.length === 0 ? (
                        <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center md:min-h-[360px] lg:min-h-[460px]">
                            <Zap className="mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {isConnected
                                    ? 'Send a message to get started'
                                    : 'Connect to a WebSocket endpoint'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {isConnected
                                    ? 'Type a message below and press Send'
                                    : 'Enter a WebSocket URL and click Connect'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={
                            isConnected
                                ? 'Type a message to send...'
                                : 'Connect first to send messages'
                        }
                        className="min-h-20 font-mono text-sm resize-none"
                        spellCheck={false}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={!isConnected}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!isConnected || !inputMessage.trim()}
                        size="sm"
                        className="h-9 px-4 gap-1.5 self-end"
                    >
                        <Send className="h-4 w-4" />
                        Send
                    </Button>
                </div>

                {status === 'error' && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                        <div>
                            <p className="text-sm font-medium text-destructive">
                                Connection Failed
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Could not connect to the WebSocket server. Check the URL and try
                                again.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'websocket',
                    tabName: 'tester',
                    getState: () => ({ content }),
                    extraActions:
                        messages.length > 0
                            ? [
                                  {
                                      id: 'copy-all-messages',
                                      label: 'Copy All Messages',
                                      icon: Copy,
                                      handler: handleCopyAll,
                                  },
                              ]
                            : [],
                }}
            />
        </ToolTabWrapper>
    );
}
