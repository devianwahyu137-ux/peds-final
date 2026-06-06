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
    const simulateMarketTick = () => {
      setMarketData(prev => {
        const fluctuate = (value) => value * (1 + (Math.random() * 0.002 - 0.001));
        
        return {
          ...prev,
          macro: {
            ...prev.macro,
            usdIdr: fluctuate(prev.macro.usdIdr),
            dxy: fluctuate(prev.macro.dxy),
            us10y: fluctuate(prev.macro.us10y),
            // biRate and inflation remain static
          },
          equities: {
            ...prev.equities,
            ihsg: fluctuate(prev.equities.ihsg),
            bbca: fluctuate(prev.equities.bbca),
            bmri: fluctuate(prev.equities.bmri),
            bbri: fluctuate(prev.equities.bbri),
            tlkm: fluctuate(prev.equities.tlkm),
          },
          commodities: {
            ...prev.commodities,
            gold: fluctuate(prev.commodities.gold),
          },
          crypto: {
            ...prev.crypto,
            btcUsdt: fluctuate(prev.crypto.btcUsdt),
          }
        };
      });
      
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
      setIsLive(true);
    };

    // Trigger immediately on mount
    simulateMarketTick();

    // Set up 3-second simulation interval
    const intervalId = setInterval(simulateMarketTick, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <MacroDataContext.Provider value={{ marketData, isLive, lastUpdated }}>
      {children}
    </MacroDataContext.Provider>
  );
}
