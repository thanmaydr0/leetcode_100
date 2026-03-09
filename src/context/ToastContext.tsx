import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'info' | 'error';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000); // Hide after 3 seconds
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-4 py-2 border rounded-sm font-mono text-xs shadow-lg animate-slideUp pointer-events-auto
              ${toast.type === 'success' ? 'bg-[#0f291e] border-forge-green text-forge-green' : toast.type === 'error' ? 'bg-[#290f0f] border-forge-red text-forge-red' : 'bg-[#1a1a1a] border-forge-border text-forge-light'}`}
                    >
                        {toast.type === 'success' && <span className="mr-2">✓</span>}
                        {toast.type === 'error' && <span className="mr-2">✗</span>}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
