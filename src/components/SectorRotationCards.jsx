import React, { useState } from "react";
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore, SCENARIOS } from "@/stores/rootStore";

const SectorRotationCards = React.memo(function SectorRotationCards() {
  const { targetWeights, weights, scenarioId, macroInputs } = useRootStore();
  const currentWeights = targetWeights || weights || {};
  const [expandedId, setExpandedId] = useState(null);

  const scenarioName = SCENARIOS[scenarioId]?.label || "Normal";
  
  // Custom rotation config per scenario
  const getEquitiesDetails = () => {
    switch (scenarioId) {
      case "TIGHTENING":
        return {
          stance: "UNDERWEIGHT",
          tickers: ["TLKM", "EXCL", "ISAT", "PGAS"],
          overweight: "Telecoms (TLKM, EXCL, ISAT) & Defensive Utilities (PGAS)",
          underweight: "Consumer Discretionary, Property, Tech Growth (GOTO)",
          rationale: `Dalam skenario ${scenarioName}, kenaikan suku bunga memicu depresiasi saham pertumbuhan. Fokus dialokasikan pada sektor telekomunikasi dan utilitas defensif yang didukung permintaan inelastis dan arus kas berkelanjutan.`
        };
      case "CURRENCY_STRESS":
        return {
          stance: "UNDERWEIGHT",
          tickers: ["ADRO", "PTBA", "INCO", "UNTR", "MEDC"],
          overweight: "Energy/Mining Commodity Exporters (ADRO, PTBA, INCO, UNTR, MEDC)",
          underweight: "High Import-Dependent Consumer Staples & Retailers",
          rationale: `Dalam skenario ${scenarioName}, pelemahan Rupiah diimbangi dengan alokasi pada eksportir komoditas energi/tambang yang mencatatkan pendapatan dalam USD, bertindak sebagai natural FX hedge.`
        };
      case "EQUILIBRIUM":
      default:
        return {
          stance: "OVERWEIGHT",
          tickers: ["BBCA", "BMRI", "BBRI", "ICBP", "MYOR"],
          overweight: "Big Banks (BBCA, BMRI, BBRI) & Core Consumer Staples (ICBP, MYOR)",
          underweight: "Debt-Laden Cyclical Developers, Pre-revenue Tech Startups",
          rationale: `Dalam skenario ${scenarioName}, perbankan tier-1 diuntungkan oleh marjin bunga bersih (NIM) yang solid, didukung stabilitas konsumsi domestik pada produk kebutuhan sehari-hari.`
        };
    }
  };

  const getBondsDetails = () => {
    switch (scenarioId) {
      case "TIGHTENING":
        return {
          stance: "OVERWEIGHT",
          tickers: ["FR0095", "FR0096", "ORI025", "SR020"],
          overweight: "Short-Duration Sovereign Bonds (SBN) - Tenor 1-3Y",
          underweight: "Long-Duration Sovereign Bonds (Tenor > 10Y), Low-Grade Corporate Debt",
          rationale: `Suku bunga BI Rate yang tinggi sebesar ${(macroInputs?.biRate || 0).toFixed(2)}% mengharuskan defensif duration strategy. Pilih SBN tenor pendek untuk membatasi price sensitivity terhadap volatilitas suku bunga.`
        };
      case "CURRENCY_STRESS":
        return {
          stance: "UNDERWEIGHT",
          tickers: ["SR021", "FR0101"],
          overweight: "SBN USD-Denominated (INDON seri USD), Cash Equivalents",
          underweight: "Rupiah Long-Term Sovereign Bonds",
          rationale: `Tekanan devaluasi Rupiah mendongkrak yield SBN 10Y ke ${(macroInputs?.sbn10y || 0).toFixed(2)}%. Batasi eksposur obligasi jangka panjang berdenominasi Rupiah untuk memitigasi duration risk dan kerugian selisih kurs.`
        };
      case "EQUILIBRIUM":
      default:
        return {
          stance: "NEUTRAL",
          tickers: ["FR0098", "FR0097", "ORI026"],
          overweight: "Medium-Duration Sovereign Bonds (SBN) - Tenor 3-5Y",
          underweight: "High-Beta Unrated Corporate Bonds",
          rationale: `Tingkat yield SBN yang stabil memberikan real return positif. Struktur imbal hasil optimal didapatkan pada tenor menengah dengan likuiditas pasar obligasi yang solid.`
        };
    }
  };

  const getGoldDetails = () => {
    switch (scenarioId) {
      case "CURRENCY_STRESS":
        return {
          stance: "OVERWEIGHT",
          tickers: ["GOLD_PHYSICAL", "ANTM", "XAU/USD"],
          overweight: "Physical Gold Vault, USD-Denominated Gold ETF",
          underweight: "Non-yielding Cash Deposits, High-beta Rupiah Debt",
          rationale: `Dalam skenario ${scenarioName}, emas bertindak sebagai pertahanan mutlak terhadap devaluasi Rupiah dan ancaman capital flight. DXY di ${(macroInputs?.dxy || 0).toFixed(2)} memposisikan emas sebagai jangkar safe-haven.`
        };
      case "TIGHTENING":
        return {
          stance: "NEUTRAL",
          tickers: ["GOLD_PHYSICAL", "MDKA"],
          overweight: "Physical Gold Vault (Hold Baseline)",
          underweight: "Derivative Gold Synthetics",
          rationale: `Kenaikan opportunity cost akibat suku bunga tinggi global menahan apresiasi masif emas, namun emas fisik tetap dipertahankan sebagai asuransi pelindung nilai inflasi jangka panjang.`
        };
      case "EQUILIBRIUM":
      default:
        return {
          stance: "NEUTRAL",
          tickers: ["GOLD_PHYSICAL"],
          overweight: "Physical Gold (Baseline Allocation)",
          underweight: "Leveraged Gold Futures",
          rationale: `Alokasi taktis minimal 10% dipertahankan untuk lindung nilai terhadap risiko sistemik makro global yang tidak terduga.`
        };
    }
  };

  const eq = getEquitiesDetails();
  const fi = getBondsDetails();
  const gd = getGoldDetails();

  const sectorCards = [
    {
      id: "equities",
      color: "#3b82f6",
      icon: <TrendingUp size={16} className="text-emerald-400" />,
      title: "EQUITIES SECTOR ROTATION",
      weight: currentWeights?.stocks || 0,
      ...eq
    },
    {
      id: "fixed_income",
      color: "#a78bfa",
      icon: <Landmark size={16} className="text-indigo-400" />,
      title: "FIXED INCOME DURATION STRATEGY",
      weight: currentWeights?.bonds || 0,
      ...fi
    },
    {
      id: "hard_assets",
      color: "#fbbf24",
      icon: <Coins size={16} className="text-amber-400" />,
      title: "HARD ASSETS VAULT STRATEGY",
      weight: currentWeights?.gold || 0,
      ...gd
    }
  ];

  return (
    <div className="border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#121212] rounded-xl p-5 space-y-4 transition-colors duration-300">
      <div>
        <h3 className="flex flex-row items-center gap-2 text-sm font-bold text-slate-900 dark:text-white font-mono"><ActivitySquare size={16} className="text-blue-400" /> ROTATION_TACTICS_PLAYBOOK</h3>
        <p className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1 uppercase tracking-wider">Contextual sector and asset class rotation matrix</p>
      </div>

      <div className="space-y-3">
        {sectorCards.map((card) => {
          const isOpen = expandedId === card.id;
          return (
            <div key={card.id} className="border border-slate-200 dark:border-neutral-900 rounded-xl bg-slate-50 dark:bg-black/40 overflow-hidden transition-all duration-200">
              <button
                onClick={() => setExpandedId(isOpen ? null : card.id)}
                className="w-full text-left p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white dark:bg-neutral-900/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{card.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white font-mono tracking-tight">{card.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-500 mt-0.5 font-mono">
                      Target Allocation: <span style={{ color: card.color }} className="font-bold">{card.weight}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    card.stance === "OVERWEIGHT" 
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                      : card.stance === "UNDERWEIGHT" 
                      ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20" 
                      : "bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border-slate-300 dark:border-neutral-700/60"
                  }`}>{card.stance}</span>
                  <span className="text-slate-400 dark:text-neutral-600 text-xs font-mono">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-3 border-t border-slate-200 dark:border-neutral-900/60 space-y-3 font-mono text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {card.tickers.map((t) => (
                      <span key={t} className="text-[9px] px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 font-bold" style={{ color: card.color }}>{t}</span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50 dark:bg-emerald-950/5">
                      <div className="text-[8px] text-emerald-600 dark:text-emerald-500 uppercase tracking-widest font-bold mb-0.5">Overweight Sectors</div>
                      <div className="text-slate-700 dark:text-neutral-300 leading-relaxed">{card.overweight}</div>
                    </div>
                    
                    <div className="p-2.5 rounded border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/5">
                      <div className="text-[8px] text-red-600 dark:text-red-500 uppercase tracking-widest font-bold mb-0.5">Underweight Sectors</div>
                      <div className="text-slate-700 dark:text-neutral-300 leading-relaxed">{card.underweight}</div>
                    </div>

                    <div className="p-2.5 rounded border border-slate-300 dark:border-neutral-900 bg-white dark:bg-neutral-950/80">
                      <div className="text-[8px] text-slate-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Institutional Rationale</div>
                      <div className="text-slate-600 dark:text-neutral-400 leading-relaxed text-[10px]">{card.rationale}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default SectorRotationCards;
