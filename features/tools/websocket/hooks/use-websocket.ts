'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WsMessage {
    id: string;
    direction: 'sent' | 'received';
    data: string;
    timestamp: number;
    size: number;
}

let messageCounter = 0;

function createMessage(direction: 'sent' | 'received', data: string): WsMessage {
    messageCounter++;
    return {
        id: `${Date.now()}-${messageCounter}`,
        direction,
        data,
        timestamp: Date.now(),
        size: new TextEncoder().encode(data).length,
    };
}

export function useWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<WsStatus>('disconnected');
    const [messages, setMessages] = useState<WsMessage[]>([]);
    const [url, setUrl] = useState('');
    const reconnectUrlRef = useRef<string>('');

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const connect = useCallback((wsUrl: string) => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        setUrl(wsUrl);
        reconnectUrlRef.current = wsUrl;
        setStatus('connecting');

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus('connected');
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
