import React, { useState, useMemo } from "react";
import { useRootStore } from "@/stores/rootStore";

const BROKER_FEE = 0.0020; // 0.20% flat fee

const ASSET_LABELS = {
  stocks: "Equities (IDX)",
  bonds: "SBN / Bonds",
  gold: "Physical Gold",
  cash: "Cash / USD"
};

const ASSET_COLORS = {
  stocks: "text-blue-400",
  bonds: "text-violet-400",
  gold: "text-yellow-400",
  cash: "text-emerald-400"
};

const RebalancingCalculator = React.memo(function RebalancingCalculator() {
  const { weights, actualWeights, targetWeights, setEquityWeight } = useRootStore();
  const currentTargetWeights = targetWeights || weights || {};
  const currentActualWeights = actualWeights || currentTargetWeights;
  
  const [capitalRaw, setCapitalRaw] = useState("100000000");

  const capital = useMemo(() => {
    const n = parseFloat(capitalRaw.replace(/\./g, ""));
    return isNaN(n) ? 0 : n;
  }, [capitalRaw]);

  const rebalanceData = useMemo(() => {
    const assets = ["stocks", "bonds", "gold", "cash"];
    return assets.map((asset) => {
      const actualPct = currentActualWeights[asset] || 0;
      const targetPct = currentTargetWeights[asset] || 0;
      
      const currentIDR = (actualPct / 100) * capital;
      const targetIDR = (targetPct / 100) * capital;
      const deltaIDR = targetIDR - currentIDR;
      const fee = Math.abs(deltaIDR) * BROKER_FEE;
      
      let action = "HOLD";
      if (deltaIDR > 500) action = "BUY";
      else if (deltaIDR < -500) action = "SELL";

      return {
        asset,
        actualPct,
        targetPct,
        currentIDR,
        targetIDR,
        deltaIDR,
        fee,
        action
      };
    });
  }, [currentActualWeights, currentTargetWeights, capital]);

  const totalFee = useMemo(() => {
    return rebalanceData.reduce((sum, r) => sum + r.fee, 0);
  }, [rebalanceData]);

  const formatIDR = (n) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(n);
  };

  return (
    <div className="border border-neutral-900 bg-neutral-950/60 rounded-xl p-5 space-y-5 font-mono">
      <div>
        <h3 className="text-sm font-bold text-white">[🛠️] REBALANCING_CALCULATOR</h3>
        <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Dynamic order calculation & trade delta sheets</p>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="block text-[9px] text-neutral-400 uppercase tracking-widest mb-1.5">
            Total Capital Value (IDR)
          </label>
          <input
            type="text"
            value={capitalRaw ? parseInt(capitalRaw.replace(/\./g, "") || "0").toLocaleString("id-ID") : ""}
            onChange={(e) => setCapitalRaw(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs tabular-nums focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[9px] text-neutral-400 uppercase tracking-widest mb-1.5">
            Current Equities Actual Weight: {Math.round(currentActualWeights.stocks || 0)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(currentActualWeights.stocks || 0)}
            onChange={(e) => setEquityWeight(parseFloat(e.target.value) || 0)}
            className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      <div className="border border-neutral-900 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-[10px] text-left border-collapse">
          <thead>
            <tr className="bg-neutral-900/60 text-neutral-400 border-b border-neutral-800">
              <th className="p-2">Asset</th>
              <th className="p-2 text-right">Actual</th>
              <th className="p-2 text-right">Target</th>
              <th className="p-2 text-right">Delta</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rebalanceData.map((row) => {
              const isBuy = row.deltaIDR > 0;
              const isZero = row.action === "HOLD";
              return (
                <tr key={row.asset} className="border-b border-neutral-900/60 hover:bg-neutral-900/10">
                  <td className={`p-2 font-bold ${ASSET_COLORS[row.asset]}`}>
                    {ASSET_LABELS[row.asset]}
                  </td>
                  <td className="p-2 text-right tabular-nums text-neutral-300">
                    {Math.round(row.actualPct)}%
                  </td>
                  <td className="p-2 text-right tabular-nums text-neutral-300">
                    {Math.round(row.targetPct)}%
                  </td>
                  <td className={`p-2 text-right font-bold tabular-nums ${
                    isZero ? "text-neutral-600" : isBuy ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {isZero ? "—" : `${isBuy ? "+" : ""}${formatIDR(row.deltaIDR)}`}
                  </td>
                  <td className="p-2 text-center">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                      isZero 
                        ? "bg-neutral-800/40 text-neutral-400 border-neutral-850" 
                        : isBuy 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>{row.action}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1 text-[9px] text-neutral-500 border-t border-neutral-900/60 pt-3">
        <div className="flex justify-between">
          <span>Broker Commission Fee (0.20%):</span>
          <span className="font-bold text-neutral-300">{formatIDR(totalFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Trading Execution Strategy:</span>
          <span className="font-bold text-emerald-400">NET CAPITAL PLAN MATCHED</span>
        </div>
      </div>
    </div>
  );
});

export default RebalancingCalculator;
