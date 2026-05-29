import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import MacroIndicatorCards from "../components/MacroIndicatorCards";
import { ACCENT, ScenarioButton } from "../components/SharedComponents";
import { DataHealthPanel } from "../components/DataHealthPanel";
import { MacroInterpretationPanel } from "../components/MacroInterpretationPanel";
import { MacroReleaseCalendar } from "../components/MacroReleaseCalendar";

/**
 * MarketPage — "KONDISI PASAR" tab.
 * Scenario selector + MacroIndicatorCards + Interpretation + Calendar.
 */
export default function MarketPage() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const crisisMode = useRootStore((s) => s.crisisMode);
  const setScenario = useRootStore((s) => s.setScenario);
  const setCrisisMode = useRootStore((s) => s.setCrisisMode);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const acc = ACCENT[currentAccent];

  return (
    <div className="space-y-6 w-full page-enter">
      {/* Data Health Panel — per-endpoint status */}
      <DataHealthPanel />

      {/* Header */}
      <div className="border-b border-neutral-900 pb-4">
        <h1 className="text-lg font-black font-mono uppercase tracking-tight">
          Kondisi Pasar <span style={{ color: acc.neon }}>// Makroekonomi</span>
        </h1>
        <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wider">
          Indikator Ekonomi Indonesia &amp; Global — Simulasi Data Live
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenario Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-xl p-4">
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-3 font-mono">
              Skenario Ekonomi
            </div>
            <div className="space-y-2">
              {Object.values(SCENARIOS).map((sc) => (
                <ScenarioButton
                  key={sc.id}
                  scenario={sc}
                  isActive={scenarioId === sc.id && !crisisMode}
                  onClick={() => setScenario(sc.id)}
                />
              ))}
            </div>
          </div>

          {/* Black Swan Panel */}
          <div className="border border-red-950 bg-red-950/5 rounded-xl p-4 space-y-2">
            <div className="text-[9px] text-red-500 uppercase tracking-widest font-bold font-mono">
              Stress Test Ekstrem
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCrisisMode(crisisMode === "HYPERINFLATION" ? null : "HYPERINFLATION")}
                className={`p-2 rounded border text-[10px] font-bold cursor-pointer transition-all font-mono ${
                  crisisMode === "HYPERINFLATION"
                    ? "bg-red-500/20 border-red-500 text-white"
                    : "border-neutral-900 text-neutral-500"
                }`}
              >
                🔥 HIPERINFLASI
              </button>
              <button
                onClick={() => setCrisisMode(crisisMode === "RUPIAH_CRASH" ? null : "RUPIAH_CRASH")}
                className={`p-2 rounded border text-[10px] font-bold cursor-pointer transition-all font-mono ${
                  crisisMode === "RUPIAH_CRASH"
                    ? "bg-red-500/20 border-red-500 text-white"
                    : "border-neutral-900 text-neutral-500"
                }`}
              >
                🚨 RUPIAH CRASH
              </button>
            </div>
          </div>
        </div>

        {/* Right: Macro Indicator Cards Grid */}
        <div className="lg:col-span-8">
          <MacroIndicatorCards />
        </div>
      </div>

      {/* Macro Interpretation Panel — below indicators */}
      <MacroInterpretationPanel />

      {/* Release Calendar */}
      <MacroReleaseCalendar />
    </div>
  );
}
