import { useEffect, useRef, memo } from "react";

/**
 * TickerBar — Live TradingView Ticker Tape Widget
 * Embeds real-time financial market data seamlessly.
 */
export const TickerBar = memo(function TickerBar() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''; // Nuke anything inside first
    }
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          { "proName": "IDX:BBCA", "title": "BBCA" },
          { "proName": "IDX:BMRI", "title": "BMRI" },
          { "proName": "IDX:BBRI", "title": "BBRI" },
          { "proName": "IDX:TLKM", "title": "TLKM" },
          { "proName": "FX_IDC:USDIDR", "title": "USD/IDR" },
          { "proName": "BINANCE:BTCUSDT", "title": "BTC/USDT" }
        ],
        "showSymbolLogo": false,
        "isTransparent": false,
        "displayMode": "regular",
        "colorTheme": "dark",
        "locale": "id"
      }
    `;
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="no-theme-transition flex items-center w-full h-[40px] overflow-hidden border-b pointer-events-none"
      style={{
        background: '#000000',
        borderColor: 'rgba(38,38,38,0.8)',
      }}
    />
  );
});
