import { useRootStore } from "@/stores/rootStore";
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { SPARKLINE_PRESETS } from "../../lib/historicalPresets";
import MacroIndicatorCard from "./MacroIndicatorCard";

/**
 * 6 Macro indicator definitions.
 * Each maps to a store key and sparkline preset.
 */
const MACRO_INDICATORS = [
  { id: "biRate",  label: "BI Rate",         unit: "%",   icon: <Landmark size={16} className="text-indigo-400" />, storeKey: "biRate"  },
  { id: "cpi",     label: "Inflasi YoY",     unit: "%",   icon: <LineChart size={16} className="text-blue-400" />, storeKey: "cpi"     },
  { id: "usdIdr",  label: "USD/IDR",         unit: "IDR", icon: "💱", storeKey: "usdIdr"  },
  { id: "dxy",     label: "DXY Index",       unit: "pts", icon: <Wallet size={16} className="text-emerald-400" />, storeKey: "dxy"     },
  { id: "gs10",    label: "US 10Y Yield",    unit: "%",   icon: "🇺🇸", storeKey: "gs10"   },
  { id: "ihsg",    label: "IHSG Composite",  unit: "pts", icon: <TrendingUp size={16} className="text-emerald-400" />, storeKey: "ihsg"    },
];

/**
 * MacroIndicatorCards — Grid container rendering 6 glassmorphic cards.
 * Reads data from the Zustand store and maps to MacroIndicatorCard.
 */
export default function MacroIndicatorCards() {
  const { scenarioId, crisisMode, macroInputs } = useRootStore();
  const { liveData, endpointStatus } = useRootStore();

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const presets = SPARKLINE_PRESETS[effectiveScenario] || SPARKLINE_PRESETS.EQUILIBRIUM;

  return (
    <div className="space-y-3">
      <div className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-mono">
        Macro Economic Indicators
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MACRO_INDICATORS.map((indicator) => {
          // Resolve value: prefer liveData, fall back to macroInputs
          const liveValue = liveData[indicator.storeKey];
          const macroValue = macroInputs[indicator.storeKey];

          // Extract numeric value
          let value;
          if (typeof liveValue === "object" && liveValue !== null) {
            value = liveValue.v ?? liveValue.value ?? macroValue ?? 0;
          } else if (typeof liveValue === "number") {
            value = liveValue;
          } else {
            value = macroValue ?? 0;
          }

          // Extract delta
          let delta = 0;
          if (typeof liveValue === "object" && liveValue !== null) {
            delta = liveValue.d || 0;
          }

          // Extract timestamp
          let timestamp = null;
          if (typeof liveValue === "object" && liveValue !== null) {
            timestamp = liveValue.t || null;
          }

          const status = endpointStatus[indicator.storeKey] || "idle";
          const sparklineData = presets[indicator.id] || [];

          return (
            <MacroIndicatorCard
              key={indicator.id}
              id={indicator.id}
              label={indicator.label}
              unit={indicator.unit}
              icon={indicator.icon}
              value={value}
              delta={delta}
              timestamp={timestamp}
              status={status}
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
