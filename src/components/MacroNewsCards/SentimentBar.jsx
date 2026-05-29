import { useState, useEffect } from "react";

/**
 * Sentiment color configuration.
 */
const SENTIMENT_COLORS = {
  BULLISH:  { fill: "#10b981", glow: "rgba(16,185,129,0.5)",  bg: "rgba(16,185,129,0.08)"  },
  BEARISH:  { fill: "#ef4444", glow: "rgba(239,68,68,0.5)",   bg: "rgba(239,68,68,0.08)"   },
  NEUTRAL:  { fill: "#737373", glow: "rgba(115,115,115,0.3)", bg: "rgba(115,115,115,0.06)" },
};

/**
 * SentimentBar — Animated fill bar at the top of a news card.
 *
 * @param {{ score: number, sentiment: string, animated?: boolean }} props
 */
export default function SentimentBar({ score, sentiment, animated = true }) {
  const [width, setWidth] = useState(animated ? 0 : score * 100);
  const colors = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.NEUTRAL;

  useEffect(() => {
    if (animated) {
      // Trigger expand animation on mount
      const timer = requestAnimationFrame(() => {
        setWidth(score * 100);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [score, animated]);

  return (
    <div className="w-full relative" style={{ height: "3px" }}>
      {/* Background track */}
      <div
        className="absolute inset-0 rounded-t-xl"
        style={{ backgroundColor: colors.bg }}
      />

      {/* Fill bar */}
      <div
        className="absolute inset-y-0 left-0 rounded-t-xl"
        style={{
          width: `${width}%`,
          backgroundColor: colors.fill,
          boxShadow: `0 0 6px ${colors.glow}`,
          transition: animated ? "width 700ms ease-out" : "none",
        }}
      />

      {/* Score label */}
      <div
        className="absolute right-2 font-mono"
        style={{
          top: "6px",
          fontSize: "9px",
          color: colors.fill,
          opacity: 0.8,
        }}
      >
        {Math.round(score * 100)}%
      </div>
    </div>
  );
}
