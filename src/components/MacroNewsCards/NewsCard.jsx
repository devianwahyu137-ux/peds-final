import React from "react";
import SentimentBar from "./SentimentBar";

/**
 * Badge class map for sentiment badges.
 */
const BADGE_CONFIG = {
  BULLISH: { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", emoji: "📈" },
  BEARISH: { cls: "bg-red-500/15 text-red-400 border border-red-500/30", emoji: "📉" },
  NEUTRAL: { cls: "bg-neutral-700/40 text-neutral-400 border border-neutral-700/40", emoji: "➡️" },
};

/**
 * Format ISO timestamp as relative "time ago" string.
 */
function formatTimeAgo(isoString) {
  if (!isoString) return "";
  const delta = Date.now() - new Date(isoString).getTime();
  if (delta < 60000) return "just now";
  if (delta < 3600000) return `${Math.floor(delta / 60000)}m ago`;
  if (delta < 86400000) return `${Math.floor(delta / 3600000)}h ago`;
  return `${Math.floor(delta / 86400000)}d ago`;
}

/**
 * NewsCard — Glassmorphic news card with sentiment bar, tags, and hover lift.
 *
 * @param {{
 *   title: string,
 *   source: string,
 *   publishedAt: string,
 *   sentiment: string,
 *   sentimentScore: number,
 *   summary: string,
 *   tags: string[],
 *   url: string,
 * }} props
 */
export default function NewsCard({
  title,
  source,
  publishedAt,
  sentiment,
  sentimentScore,
  summary,
  tags,
  url,
}) {
  const badge = BADGE_CONFIG[sentiment] || BADGE_CONFIG.NEUTRAL;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group"
      style={{
        background: "rgba(10, 10, 10, 0.70)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Sentiment Bar — full width at top */}
      <SentimentBar score={sentimentScore} sentiment={sentiment} />

      {/* Card Content */}
      <div className="p-4">
        {/* Source + Time */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
            {source}
          </span>
          <span className="text-[9px] font-mono text-neutral-600 tabular-nums">
            {formatTimeAgo(publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold leading-snug text-white mb-1.5 line-clamp-2 font-mono">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            {title}
          </a>
        </h4>

        {/* Summary */}
        <p className="text-[10px] text-neutral-500 leading-relaxed font-mono line-clamp-2 mb-3">
          {summary}
        </p>

        {/* Tags + Sentiment Badge */}
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <span
                key={tag}
                className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/60 text-neutral-500 border border-neutral-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${badge.cls}`}>
            {badge.emoji} {sentiment}
          </span>
        </div>
      </div>
    </div>
  );
}
