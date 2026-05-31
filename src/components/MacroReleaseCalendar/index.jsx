// src/components/MacroReleaseCalendar/index.jsx
// Upcoming macro data release schedule

const RELEASE_EVENTS = [
  {
    date:      'Setiap Kamis ke-3/4',
    event:     'Rapat Dewan Gubernur Bank Indonesia',
    indicator: 'BI Rate',
    impact:    'HIGH',
    note:      'Pengumuman sekitar 14:00 WIB',
  },
  {
    date:      'Awal bulan (H+1)',
    event:     'Rilis Data Inflasi BPS',
    indicator: 'CPI YoY',
    impact:    'HIGH',
    note:      'Sekitar pukul 11:00 WIB',
  },
  {
    date:      'Jumat pertama bulan',
    event:     'Non-Farm Payrolls AS',
    indicator: 'NFP / Unemployment',
    impact:    'HIGH',
    note:      '19:30 WIB — pengaruh langsung ke DXY & IDR',
  },
  {
    date:      'Pertengahan bulan',
    event:     'Rilis Data CPI Amerika Serikat',
    indicator: 'US CPI',
    impact:    'HIGH',
    note:      '19:30 WIB — sinyal arah Fed Funds Rate',
  },
  {
    date:      'Setiap minggu (Kamis)',
    event:     'Lelang SBN / SBSN',
    indicator: 'SBN Yield',
    impact:    'MEDIUM',
    note:      'Bid-to-cover ratio cerminkan minat investor',
  },
  {
    date:      'Akhir bulan',
    event:     'Data Neraca Perdagangan Indonesia',
    indicator: 'Trade Balance',
    impact:    'MEDIUM',
    note:      'Surplus trade = support untuk Rupiah',
  },
];

const IMPACT_STYLE = {
  HIGH:   { cls: 'bg-red-500/15 text-red-400 border-red-500/30',       dot: '#ef4444' },
  MEDIUM: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: '#f59e0b' },
  LOW:    { cls: 'bg-neutral-700/40 text-slate-400 dark:text-neutral-500 border-neutral-700/40', dot: 'var(--as-text-tertiary)' },
};

export function MacroReleaseCalendar() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-mono font-bold">
            Release Calendar
          </div>
          <div className="text-[10px] text-neutral-600 font-mono mt-0.5">
            Jadwal Rilis Data Makro Kritis
          </div>
        </div>
        <span className="text-[8px] font-mono text-neutral-700 tracking-widest">
          WIB (UTC+7)
        </span>
      </div>

      <div className="space-y-2">
        {RELEASE_EVENTS.map((ev, i) => {
          const imp = IMPACT_STYLE[ev.impact] ?? IMPACT_STYLE.LOW;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-300 dark:border-neutral-800/40 bg-white dark:bg-neutral-900/30"
            >
              {/* Impact dot */}
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: imp.dot }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                    {ev.event}
                  </span>
                  <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border ${imp.cls}`}>
                    {ev.impact}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 mt-0.5">
                  {ev.note}
                </div>
              </div>

              {/* Right: date + indicator */}
              <div className="text-right flex-shrink-0">
                <div className="text-[9px] font-mono font-bold text-slate-500 dark:text-neutral-400">
                  {ev.indicator}
                </div>
                <div className="text-[8px] font-mono text-neutral-600 mt-0.5">
                  {ev.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
