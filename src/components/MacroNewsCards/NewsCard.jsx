import SentimentBar from "./SentimentBar";
import { TrendingUp, TrendingDown, ArrowRight, Percent, Shield, Coins, DollarSign, Wallet } from "lucide-react";

/**
 * Badge class map for sentiment badges.
 */
const BADGE_CONFIG = {
  BULLISH: { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", emoji: <TrendingUp size={16} className="text-emerald-400" /> },
  BEARISH: { cls: "bg-red-500/15 text-red-400 border border-red-500/30", emoji: <TrendingDown size={16} className="text-red-400" /> },
  NEUTRAL: { cls: "bg-neutral-700/40 text-slate-500 dark:text-neutral-400 border border-neutral-700/40", emoji: <ArrowRight size={16} className="text-slate-400" /> },
};

/**
 * Returns Lucide icon based on category name.
 */
function getCategoryIcon(kategori) {
  const kat = (kategori || "").toUpperCase();
  if (kat.includes("SUKU BUNGA")) return <Percent size={12} className="text-indigo-400" />;
  if (kat.includes("OBLIGASI")) return <Shield size={12} className="text-emerald-400" />;
  if (kat.includes("SAHAM")) return <TrendingUp size={12} className="text-blue-400" />;
  if (kat.includes("EMAS")) return <Coins size={12} className="text-yellow-500" />;
  if (kat.includes("MATA UANG")) return <DollarSign size={12} className="text-sky-400" />;
  if (kat.includes("LIKUIDITAS")) return <Wallet size={12} className="text-slate-400" />;
  return <ArrowRight size={12} className="text-neutral-500" />;
}

/**
 * NewsCard (now functioning as MacroNoteCard) — Glassmorphic research note card with sentiment bar, tags, and category icon.
 *
 * @param {{
 *   title: string,
 *   kategori: string,
 *   sentiment: string,
 *   sentimentScore: number,
 *   summary: string,
 *   tags: string[],
 * }} props
 */
export default function NewsCard({
  title,
  kategori,
  sentiment,
  sentimentScore,
  summary,
  tags,
}) {
  const badge = BADGE_CONFIG[sentiment] || BADGE_CONFIG.NEUTRAL;

  return (
    <div
      className="card-hover rounded-xl overflow-hidden transition-all duration-200 cursor-default group relative"
      style={{
        background: "var(--as-bg-secondary)",
        border: "1px solid var(--as-border-primary)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Sentiment Bar — full width at top */}
      <SentimentBar score={sentimentScore} sentiment={sentiment} />

      {/* Card Content */}
      <div className="p-5">
        {/* Category Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="flex-shrink-0 flex items-center">
            {getCategoryIcon(kategori)}
          </span>
          <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-400 uppercase tracking-widest font-bold">
            {kategori}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-[13px] font-bold leading-snug text-slate-900 dark:text-white mb-2 line-clamp-2 font-mono group-hover:text-emerald-400 transition-colors"
            style={{ lineHeight: '1.5' }}>
          {title}
        </h4>

        {/* Summary */}
        <p className="text-[10px] text-slate-400 dark:text-neutral-500 leading-relaxed font-mono line-clamp-3 mb-4">
          {summary}
        </p>

        {/* Tags + Sentiment Badge */}
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <span
                key={tag}
                className="text-[8px] font-mono px-1.5 py-0.5 rounded-md"
                style={{
                  background: 'var(--as-bg-tertiary)',
                  color: 'var(--as-text-dim)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg tracking-widest flex-shrink-0 ${badge.cls}`}>
            {sentiment === 'BULLISH' ? '▲' : sentiment === 'BEARISH' ? '▼' : '→'} {sentiment}
          </span>
        </div>
      </div>
    </div>
  );
}

