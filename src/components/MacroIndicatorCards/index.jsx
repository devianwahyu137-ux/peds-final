import { useRootStore } from "@/stores/rootStore";
import { Landmark, LineChart, Wallet, TrendingUp, Coins, Flag } from "lucide-react";
import { SPARKLINE_PRESETS } from "../../lib/historicalPresets";
import MacroIndicatorCard from "./MacroIndicatorCard";
import { formatNumber, formatPoints, formatIDR } from "@/utils/format";

const MACRO_INDICATORS = [
  { id: "biRate",  label: "BI Rate",         unit: "%",   icon: <Landmark size={16} className="text-indigo-400" /> },
  { id: "cpi",     label: "Inflasi YoY",     unit: "%",   icon: <LineChart size={16} className="text-blue-400" />  },
  { id: "usdIdr",  label: "USD/IDR",         unit: "IDR", icon: <Coins size={16} className="text-amber-500" />  },
  { id: "dxy",     label: "DXY Index",       unit: "pts", icon: <Wallet size={16} className="text-emerald-400" />  },
  { id: "gs10",    label: "US 10Y Yield",    unit: "%",   icon: <Flag size={16} className="text-blue-400" />   },
  { id: "ihsg",    label: "IHSG Composite",  unit: "pts", icon: <TrendingUp size={16} className="text-emerald-400" /> },
];

export default function MacroIndicatorCards() {
  const { scenarioId, crisisMode, liveData, macro } = useRootStore();

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const presets = SPARKLINE_PRESETS[effectiveScenario] || SPARKLINE_PRESETS.EQUILIBRIUM;

  const getMarketValueFormatted = (id) => {
    switch (id) {
      case "biRate": return formatNumber(macro.biRate || 0, 2);
      case "cpi":    return formatNumber(macro.inflasi || 0, 2);
      case "usdIdr": return formatIDR(macro.usdIdr || 0);
      case "dxy":    return formatPoints(macro.dxy || 0);
      case "gs10":   return formatNumber(macro.us10y || 0, 2);
      case "ihsg":   return formatPoints(macro.ihsg || 0);
      default:       return "0";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-mono">
          Macro Economic Indicators
        </div>
        <div className="text-[9px] text-amber-500/80 uppercase font-mono tracking-wider font-bold">
          * Data estimasi per Mei 2026, bukan data live real-time
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MACRO_INDICATORS.map((indicator) => {
          const value = getMarketValueFormatted(indicator.id);
          const sparklineData = presets[indicator.id] || [];
          const timestamp = liveData[indicator.id]?.t || null;
          const isIndicatorLive = indicator.id === 'biRate' ? (liveData?.bi_macro?.biRate != null || liveData?.bi_macro?.v != null || liveData?.biRate?.v != null) :
                                  indicator.id === 'cpi' ? (liveData?.bi_macro?.cpi != null || liveData?.cpi?.v != null) :
                                  liveData[indicator.id]?.v != null;
          
          return (
            <MacroIndicatorCard
              key={indicator.id}
              id={indicator.id}
              label={indicator.label}
              unit={indicator.unit}
              icon={indicator.icon}
              value={value}
              timestamp={timestamp}
              isLive={isIndicatorLive}
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
