import { useRootStore } from "@/stores/rootStore";
import { Landmark, LineChart, Wallet, TrendingUp } from "lucide-react";
import { SPARKLINE_PRESETS } from "../../lib/historicalPresets";
import MacroIndicatorCard from "./MacroIndicatorCard";
import { useMarketData } from '@/contexts/MacroDataContext';

const MACRO_INDICATORS = [
  { id: "biRate",  label: "BI Rate",         unit: "%",   icon: <Landmark size={16} className="text-indigo-400" /> },
  { id: "cpi",     label: "Inflasi YoY",     unit: "%",   icon: <LineChart size={16} className="text-blue-400" />  },
  { id: "usdIdr",  label: "USD/IDR",         unit: "IDR", icon: "💱"  },
  { id: "dxy",     label: "DXY Index",       unit: "pts", icon: <Wallet size={16} className="text-emerald-400" />  },
  { id: "gs10",    label: "US 10Y Yield",    unit: "%",   icon: "🇺🇸"   },
  { id: "ihsg",    label: "IHSG Composite",  unit: "pts", icon: <TrendingUp size={16} className="text-emerald-400" /> },
];

export default function MacroIndicatorCards() {
  const { scenarioId, crisisMode } = useRootStore();
  const { marketData, isLive } = useMarketData();

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const presets = SPARKLINE_PRESETS[effectiveScenario] || SPARKLINE_PRESETS.EQUILIBRIUM;

  const getMarketValue = (id) => {
    switch (id) {
      case "biRate": return marketData.macro.biRate;
      case "cpi":    return marketData.macro.inflation;
      case "usdIdr": return marketData.macro.usdIdr;
      case "dxy":    return marketData.macro.dxy;
      case "gs10":   return marketData.macro.us10y;
      case "ihsg":   return marketData.equities.ihsg;
      default:       return 0;
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-mono">
        Macro Economic Indicators
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MACRO_INDICATORS.map((indicator) => {
          const value = getMarketValue(indicator.id);
          const sparklineData = presets[indicator.id] || [];
          
          return (
            <MacroIndicatorCard
              key={indicator.id}
              id={indicator.id}
              label={indicator.label}
              unit={indicator.unit}
              icon={indicator.icon}
              value={value}
              delta={0} // Fixed delta to 0, no mock data provided
              timestamp={null}
              status={isLive ? "LIVE" : "idle"}
              scenarioId={scenarioId}
              sparklineData={sparklineData}
              crisisMode={crisisMode}
            />
          );
        })}
      </div>
    </div>
  );
}
