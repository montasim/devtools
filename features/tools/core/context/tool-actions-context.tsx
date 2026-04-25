'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface ToolActionsContextValue {
    save: (() => void) | null;
    share: (() => void) | null;
}

const ToolActionsContext = createContext<ToolActionsContextValue>({
    save: null,
    share: null,
});

export function useToolActionsContext() {
    return useContext(ToolActionsContext);
}

interface Registration {
    save?: () => void;
    share?: () => void;
}

const RegisterContext = createContext<(actions: Registration) => void>(() => {});

export function useToolActionsRegistrar() {
    return useContext(RegisterContext);
}

export function ToolActionsProvider({ children }: { children: ReactNode }) {
    const [registration, setRegistration] = useState<Registration>({});

    const register = (actions: Registration) => {
        setRegistration(actions);
    };

    const value: ToolActionsContextValue = {
        save: registration.save ?? null,
        share: registration.share ?? null,
    };

    return (
        <RegisterContext.Provider value={register}>
            <ToolActionsContext.Provider value={value}>{children}</ToolActionsContext.Provider>
        </RegisterContext.Provider>
    );
}
