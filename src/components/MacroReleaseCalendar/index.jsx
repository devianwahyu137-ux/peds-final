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

      <div className="flex flex-col">
        {RELEASE_EVENTS.map((ev, i) => {
          const imp = IMPACT_STYLE[ev.impact] ?? IMPACT_STYLE.LOW;
          const isHigh = ev.impact === 'HIGH';
          return (
            <div
              key={i}
              className="row-hover flex items-start gap-4 px-5 py-4 relative"
              style={{
                borderBottom: '1px solid var(--as-border-secondary)',
                background:   isHigh ? `${imp.dot}05` : 'transparent',
              }}
            >
              {/* Impact indicator — left border accent for HIGH */}
              {isHigh && (
                <div
                  className="absolute left-0 inset-y-0 w-0.5 rounded-r-full"
                  style={{ background: imp.dot }}
                />
              )}

              {/* Dot with pulse for HIGH */}
              <div className="flex-shrink-0 mt-1">
                {isHigh ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full
                                     rounded-full opacity-40"
                          style={{ backgroundColor: imp.dot }} />
                    <span className="relative inline-flex rounded-full h-2 w-2"
                          style={{ backgroundColor: imp.dot }} />
                  </span>
                ) : (
                  <div className="w-2 h-2 rounded-full"
                       style={{ backgroundColor: imp.dot, opacity: 0.7 }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold"
                        style={{ color: 'var(--as-text-primary)' }}>
                    {ev.event}
                  </span>
                  <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-md
                                    tracking-widest border ${imp.cls}`}>
                    {ev.impact}
                  </span>
                </div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--as-text-dim)' }}>
                  {ev.note}
                </div>
              </div>

              {/* Right: indicator + schedule */}
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-mono font-bold"
                     style={{ color: imp.dot }}>
                  {ev.indicator}
                </div>
                <div className="text-[8px] font-mono mt-0.5"
                     style={{ color: 'var(--as-text-dim)' }}>
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
