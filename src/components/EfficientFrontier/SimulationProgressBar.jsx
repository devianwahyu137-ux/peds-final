// src/components/EfficientFrontier/SimulationProgressBar.jsx
// Animated progress bar shown during simulation
// Displays stage label + percentage

import { useScenarioId } from '../../stores/selectors.js';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse.js';

export function SimulationProgressBar({ progress, status }) {
  const scenarioId = useScenarioId();
  const config     = SCENARIO_CONFIG[scenarioId];

  if (status !== 'running') return null;

  const stageLabel =
    progress < 10  ? 'Menginisialisasi simulasi...'     :
    progress < 50  ? 'Mensimulasikan 1.000 jalur...'   :
    progress < 80  ? 'Menghitung frontier efisiensi...' :
    progress < 95  ? 'Menyusun hasil analisis...'       :
                     'Hampir selesai...';

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-neutral-500">
          {stageLabel}
        </span>
        <span
          className="text-[9px] font-mono font-bold tabular-nums"
          style={{ color: config.color }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-neutral-900 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width:      `${progress}%`,
            background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
            boxShadow:  `0 0 8px ${config.color}60`,
          }}
        />
      </div>
    </div>
  );
}
