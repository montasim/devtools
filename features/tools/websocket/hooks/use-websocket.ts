'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WsMessage {
    id: string;
    direction: 'sent' | 'received' | 'system';
    data: string;
    timestamp: number;
    size: number;
}

let messageCounter = 0;

function createMessage(direction: WsMessage['direction'], data: string): WsMessage {
    messageCounter++;
    return {
        id: `${Date.now()}-${messageCounter}`,
        direction,
        data,
        timestamp: Date.now(),
        size: new TextEncoder().encode(data).length,
    };
}

export interface WsConnectOptions {
    url: string;
    protocols?: string[];
    authMessage?: string;
}

export function useWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<WsStatus>('disconnected');
    const [messages, setMessages] = useState<WsMessage[]>([]);
    const [url, setUrl] = useState('');
    const reconnectUrlRef = useRef<string>('');
    const authMessageRef = useRef<string>('');

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const connect = useCallback((options: WsConnectOptions | string) => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const opts = typeof options === 'string' ? { url: options } : options;
        const { url: wsUrl, protocols, authMessage } = opts;

        setUrl(wsUrl);
        reconnectUrlRef.current = wsUrl;
        authMessageRef.current = authMessage || '';
        setStatus('connecting');

        try {
            const ws =
                protocols && protocols.length > 0
                    ? new WebSocket(wsUrl, protocols)
                    : new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus('connected');

                if (authMessageRef.current) {
                    try {
                        ws.send(authMessageRef.current);
                        setMessages((prev) => [
                            ...prev,
                            createMessage(
                                'system',
                                `Auth message sent (${new TextEncoder().encode(authMessageRef.current).length} bytes)`,
                            ),
                        ]);
                    } catch {
                        setMessages((prev) => [
                            ...prev,
                            createMessage('system', 'Failed to send auth message'),
                        ]);
                    }
                }

                if (protocols && protocols.length > 0) {
                    setMessages((prev) => [
                        ...prev,
                        createMessage('system', `Negotiated protocol: ${ws.protocol || 'none'}`),
                    ]);
                }
            };

            ws.onmessage = (event) => {
                const data =
                    typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
                setMessages((prev) => [...prev, createMessage('received', data)]);
            };

            ws.onerror = () => {
                setStatus('error');
            };

            ws.onclose = (event) => {
                wsRef.current = null;
                const closeMsg = event.reason
                    ? `Connection closed (${event.code}: ${event.reason})`
                    : `Connection closed (code: ${event.code})`;
                setMessages((prev) => [...prev, createMessage('system', closeMsg)]);
                if (event.code !== 1000) {
                    setStatus('error');
                } else {
                    setStatus('disconnected');
                }
            };
        } catch {
            setStatus('error');
        }
    }, []);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'Client disconnected');
            wsRef.current = null;
        }
        setStatus('disconnected');
    }, []);

    const send = useCallback((data: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return false;
        }
        wsRef.current.send(data);
        setMessages((prev) => [...prev, createMessage('sent', data)]);
        return true;
    }, []);

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
        };
    }, []);

    return {
        status,
        messages,
        url,
        connect,
        disconnect,
        send,
        clearMessages,
    };
}
