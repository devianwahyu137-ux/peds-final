// src/components/SectorPlaybook/index.jsx
import { useRootStore } from '@/stores/rootStore';
import { SECTOR_PLAYBOOK } from '@/lib/sectorPlaybookData';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { SectorCard } from './SectorCard';
import { ActivitySquare } from 'lucide-react';

export function SectorPlaybook() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const sectors    = SECTOR_PLAYBOOK[scenarioId] ?? [];
  const config     = SCENARIO_CONFIG[scenarioId];

  if (!sectors.length) return null;

  // Compute stance summary
  const overweight   = sectors.filter(s => ['OVERWEIGHT','MAXIMUM'].includes(s.stance)).length;
  const underweight  = sectors.filter(s => ['UNDERWEIGHT','AVOID'].includes(s.stance)).length;
  const neutral      = sectors.filter(s => s.stance === 'NEUTRAL').length;

  return (
    <div className="card-tier-2 space-y-4 transition-colors duration-300">
      {/* Panel header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--as-text-primary)]">
            <ActivitySquare size={18} className="text-blue-400" />
            <span className="font-bold tracking-wide text-sm uppercase">ROTATION TACTICS PLAYBOOK</span>
          </div>
          <p className="text-[10px] font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">
            Strategi Rotasi Sektoral • Klik kartu untuk expand ticker & analisis detail
          </p>
        </div>

        {/* Stance summary pills */}
        <div className="flex items-center gap-2 text-[9px] font-mono font-bold">
          {overweight > 0 && (
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ▲ {overweight} OVERWEIGHT
            </span>
          )}
          {neutral > 0 && (
            <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              → {neutral} NEUTRAL
            </span>
          )}
          {underweight > 0 && (
            <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
              ▼ {underweight} UNDERWEIGHT/AVOID
            </span>
          )}
        </div>
      </div>

      {/* Sector cards */}
      <div className="space-y-3">
        {sectors.map((sector) => (
          <SectorCard key={sector.id} sector={sector} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-800 text-[9px] font-mono text-slate-400 dark:text-neutral-500 text-center uppercase tracking-widest leading-relaxed">
        * Rekomendasi sektoral bersifat kontekstual terhadap skenario makro aktif.
        Bukan rekomendasi beli/jual saham secara spesifik. Data market cap bersifat
        estimasi. Konsultasikan keputusan investasi dengan advisor terdaftar OJK.
      </div>
    </div>
  );
}
