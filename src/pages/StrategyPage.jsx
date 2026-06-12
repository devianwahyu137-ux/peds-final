import { SectorPlaybook } from "../components/SectorPlaybook";
import DriftMonitor from "../components/DriftMonitor";
import RebalancingCalculator from "../components/RebalancingCalculator";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';
import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import { ACCENT } from "../components/SharedComponents";

/**
 * StrategyPage — "STRATEGI" tab.
 * Wraps existing rebalancing components.
 */
export default function StrategyPage() {
  const scenarioId  = useRootStore((s) => s.scenarioId);
  const crisisMode  = useRootStore((s) => s.crisisMode);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const acc = ACCENT[currentAccent] || ACCENT.emerald;

  return (
    <div className="space-y-8 w-full page-enter">
      {/* Header */}
      <div className="border-b border-[var(--as-border-secondary)] pb-6">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">
          STRATEGI
          <span className="text-gray-600 mx-3 font-light">//</span>
          <span style={{ color: acc.neon }}>REBALANCING</span>
        </h2>
        <p className="text-[10px] font-sans font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">
          Kalkulator penyesuaian portofolio dan rotasi sektoral
        </p>
      </div>

      {/* Main 3-column grid — correct proportions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full overflow-x-hidden">

        {/* LEFT: Rotation Tactics Playbook — col-span-4 */}
        <div className="col-span-1 xl:col-span-4 min-w-0 overflow-hidden space-y-6">
          <ScenarioIntelligence />
          <div className="overflow-hidden">
            <SectorPlaybook />
          </div>
        </div>

        {/* MIDDLE: Drift Monitor Core — col-span-5 */}
        <div className="col-span-1 xl:col-span-5 min-w-0">
          <DriftMonitor />
        </div>

        {/* RIGHT: Rebalancing Calculator — col-span-3 */}
        <div className="col-span-1 xl:col-span-3 min-w-0">
          <RebalancingCalculator />
        </div>

      </div>
    </div>
  );
}
