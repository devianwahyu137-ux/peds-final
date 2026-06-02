import React, { createContext, useContext, useState, useEffect } from 'react';

const MacroDataContext = createContext(null);

export function useMarketData() {
  const context = useContext(MacroDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MacroDataProvider');
  }
  return context;
}

export function MacroDataProvider({ children }) {
  const [marketData, setMarketData] = useState({
    macro: {
      usdIdr: 17879.00,
      biRate: 5.25,
      inflation: 3.48,
      dxy: 104.50,
      us10y: 4.40
    },
    equities: {
      ihsg: 7096.47,
      bbca: 5700.00,
      bmri: 4080.00,
      bbri: 2950.00,
      tlkm: 3030.00
    },
    commodities: {
      gold: 2342.10
    },
    crypto: {
      btcUsdt: 70842.00
    }
  });

  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const fetchLiveMarketData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_MARKET_API_URL || '/api/market-data';
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const fetchedData = await response.json();
        
        setMarketData(prev => ({ ...prev, ...fetchedData }));
        setLastUpdated(new Date().toLocaleTimeString());
        setIsLive(true);
      } catch (error) {
        console.error('Error fetching live market data:', error);
        setIsLive(false);
      }
    };

    // Fetch immediately on mount
    fetchLiveMarketData();

    // Set up 60-second polling interval
    const intervalId = setInterval(fetchLiveMarketData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <MacroDataContext.Provider value={{ marketData, isLive, lastUpdated }}>
      {children}
    </MacroDataContext.Provider>
  );
}
