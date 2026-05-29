import MasterDetailLayout from "../components/MasterDetailLayout";
import SectorRotationCards from "../components/SectorRotationCards";
import DriftMonitor from "../components/DriftMonitor";
import RebalancingCalculator from "../components/RebalancingCalculator";

/**
 * StrategyPage — "STRATEGI" tab.
 * Wraps existing rebalancing components.
 * Content preserved — only wrapper added.
 */
export default function StrategyPage() {
  return (
    <div className="space-y-6 w-full page-enter">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-4">
        <h1 className="text-lg font-black font-mono uppercase tracking-tight">
          Strategi <span className="text-emerald-400">// Rebalancing</span>
        </h1>
        <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wider">
          Kalkulator penyesuaian portofolio dan rotasi sektoral
        </p>
      </div>

      <MasterDetailLayout
        left={<SectorRotationCards />}
        center={<DriftMonitor />}
        right={<RebalancingCalculator />}
      />
    </div>
  );
}
