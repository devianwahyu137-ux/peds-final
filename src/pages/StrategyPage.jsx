import { SectorPlaybook } from "../components/SectorPlaybook";
import DriftMonitor from "../components/DriftMonitor";
import RebalancingCalculator from "../components/RebalancingCalculator";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';

/**
 * StrategyPage — "STRATEGI" tab.
 * Wraps existing rebalancing components.
 */
export default function StrategyPage() {
  return (
    <div className="space-y-6 w-full page-enter">
      {/* Header */}
      <div className="border-b border-[var(--as-border-secondary)] pb-4">
        <h1 className="text-lg font-black font-mono uppercase tracking-tight">
          Strategi <span className="text-emerald-400">// Rebalancing</span>
        </h1>
        <p className="text-[10px] font-mono font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">
          Kalkulator penyesuaian portofolio dan rotasi sektoral
        </p>
      </div>

      {/* Main 3-column grid — correct proportions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full overflow-x-hidden">

        {/* LEFT: Rotation Tactics Playbook — col-span-4 */}
        <div className="col-span-1 xl:col-span-4 min-w-0">
          <ScenarioIntelligence />
          <SectorPlaybook />
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
