import MasterDetailLayout from "../components/MasterDetailLayout";
import { SectorPlaybook } from "../components/SectorPlaybook";
import DriftMonitor from "../components/DriftMonitor";
import RebalancingCalculator from "../components/RebalancingCalculator";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';

/**
 * StrategyPage — "STRATEGI" tab.
 * Wraps existing rebalancing components.
 * Content preserved — only wrapper added.
 */
export default function StrategyPage() {
  return (
    <div className="space-y-6 w-full page-enter">
      <ScenarioIntelligence />
      {/* Header */}
      <div className="border-b border-[var(--as-border-secondary)] pb-4">
        <h1 className="text-lg font-black font-mono uppercase tracking-tight">
          Strategi <span className="text-emerald-400">// Rebalancing</span>
        </h1>
        <p className="text-[10px] font-mono font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">
          Kalkulator penyesuaian portofolio dan rotasi sektoral
        </p>
      </div>

      <MasterDetailLayout
        left={<SectorPlaybook />}
        center={<DriftMonitor />}
        right={<RebalancingCalculator />}
      />
    </div>
  );
}
