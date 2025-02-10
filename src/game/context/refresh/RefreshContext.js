import React, { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
 const [refreshesLeft, setRefreshesLeft] = useState(() => {
   // For development/testing - always reset to 3
   if (process.env.NODE_ENV === 'development') {
     localStorage.setItem('mainGameRefreshes', '3');
     return 3;
   }

   // Original production logic
   const stored = localStorage.getItem('mainGameRefreshes');
   const today = new Date().toLocaleDateString();
   const storedDate = localStorage.getItem('mainGameRefreshDate');
   
   if (storedDate !== today) {
     localStorage.setItem('mainGameRefreshes', '3');
     localStorage.setItem('mainGameRefreshDate', today);
     return 3;
   }
   
   return stored ? parseInt(stored, 10) : 3;
 });

 const handleRefresh = () => {
   console.log('handleRefresh called, refreshes left:', refreshesLeft);
   if (refreshesLeft > 0) {
     setRefreshesLeft(prev => {
       const newCount = prev - 1;
       localStorage.setItem('mainGameRefreshes', newCount.toString());
       return newCount;
     });
     return true;
   }
   return false;
 };

 return (
   <RefreshContext.Provider value={{ refreshesLeft, handleRefresh }}>
     {children}
   </RefreshContext.Provider>
 );
}

export function useRefresh() {
 const context = useContext(RefreshContext);
 if (!context) {
   throw new Error('useRefresh must be used within RefreshProvider');
 }
 return context;
}