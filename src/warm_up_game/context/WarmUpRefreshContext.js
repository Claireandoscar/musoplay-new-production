// src/warm_up_game/context/WarmUpRefreshContext.js
import React, { createContext, useContext, useState } from 'react';

const WarmUpRefreshContext = createContext();

export function WarmUpRefreshProvider({ children }) {
    // For warm-up mode, we don't need to track or limit refreshes
    // but we might want to track if a refresh is in progress
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Return true to indicate refresh is allowed (always in warm-up mode)
        setTimeout(() => setIsRefreshing(false), 500); // Brief delay to prevent spam
        return true;
    };

    return (
        <WarmUpRefreshContext.Provider value={{ isRefreshing, handleRefresh }}>
            {children}
        </WarmUpRefreshContext.Provider>
    );
}

export function useWarmUpRefresh() {
    const context = useContext(WarmUpRefreshContext);
    if (!context) {
        throw new Error('useWarmUpRefresh must be used within WarmUpRefreshProvider');
    }
    return context;
}