import { memo } from "react";
import { useDataStore } from "../../stores/alphaShieldStore";

/**
 * TickerBar — Hardware-accelerated marquee ticker.
 * Extracted from AlphaShield.jsx. Fixed top position, z-50.
 */
export const TickerBar = memo(function TickerBar() {
  const macroInputs = useDataStore((s) => s.macroInputs);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full overflow-hidden bg-neutral-950/90 border-b border-neutral-900 py-2 flex items-center">
      <div className="animate-ticker-ha flex gap-8 text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
        <span>BBCA IDR 10.150 (+0.45%)</span>
        <span>BMRI IDR 6.850 (-0.20%)</span>
        <span>BBRI IDR 4.720 (0.00%)</span>
        <span>TLKM IDR 3.940 (+1.10%)</span>
        <span>SBN 10Y {(macroInputs.sbn10y || 0).toFixed(2)}%</span>
        <span>DXY {(macroInputs.dxy || 0).toFixed(2)}</span>
        <span>GOLD VAULT USD 2.342 (+1.15%)</span>
        <span>BI RATE {(macroInputs.biRate || 0).toFixed(2)}%</span>
        {/* Duplicate for seamless loop */}
        <span>BBCA IDR 10.150 (+0.45%)</span>
        <span>BMRI IDR 6.850 (-0.20%)</span>
        <span>BBRI IDR 4.720 (0.00%)</span>
        <span>TLKM IDR 3.940 (+1.10%)</span>
        <span>SBN 10Y {(macroInputs.sbn10y || 0).toFixed(2)}%</span>
        <span>DXY {(macroInputs.dxy || 0).toFixed(2)}</span>
        <span>GOLD VAULT USD 2.342 (+1.15%)</span>
        <span>BI RATE {(macroInputs.biRate || 0).toFixed(2)}%</span>
      </div>
    </div>
  );
});
