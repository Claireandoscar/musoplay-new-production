import React from 'react';

export const AnalyticsProvider = ({ children }) => {
  // Initialize Microsoft Clarity
  React.useEffect(() => {
    try {
      if (window.clarity) {
        console.log('Clarity initialized');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }, []);

  return <>{children}</>;
};

export default AnalyticsProvider;