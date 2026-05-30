import { useState, useEffect } from "react";
import { fetchWithFallback } from "../lib/apiFetcher";
import { NEWS_ENDPOINT, TRANSFORMERS } from "../lib/dataSources";

const STATIC_NEWS_FALLBACK = [
  {
    title: "Global Macro Pulse: USD Strength Triggers Emerging Markets Capital Reallocation",
    summary: "As the Dollar Index (DXY) rises past 106, international capital managers are rotating out of high-beta emerging equities into sovereign cash reserves.",
    url: "https://www.alphavantage.co",
    source: "AlphaShield Macro Intelligence",
    overall_sentiment_label: "Bearish",
    time_published: "20260521T080000"
  },
  {
    title: "Sovereign Yield Curve Inversion: Fixed Income Safe Havens See Record Inflows",
    summary: "Institutional debt desks are heavily bidding Government SBNs, causing yields to compress slightly while securing yields above 6.5%.",
    url: "https://www.alphavantage.co",
    source: "Bank Indonesia Consensuses",
    overall_sentiment_label: "Bullish",
    time_published: "20260521T073000"
  },
  {
    title: "Commodity Decoupling: Precious Metals Assert Dominance Amid Currency Volatility",
    summary: "Gold vault allocations continue to surge as global sovereign banks diversify treasury reserves away from paper currencies.",
    url: "https://www.alphavantage.co",
    source: "Global Gold Registry",
    overall_sentiment_label: "Somewhat Bullish",
    time_published: "20260521T070000"
  }
];

function formatNewsTime(timeStr) {
  if (!timeStr || timeStr.length < 8) return "";
  const y = timeStr.substring(0, 4);
  const m = timeStr.substring(4, 6);
  const d = timeStr.substring(6, 8);
  const hh = timeStr.substring(9, 11) || "00";
  const mm = timeStr.substring(11, 13) || "00";
  return `${d}-${m}-${y} ${hh}:${mm} UTC`;
}

function getSentimentStyle(label) {
  const lbl = (label || "").toUpperCase();
  if (lbl.includes("BULLISH")) {
    return { badge: "[ BULLISH ]", class: "text-emerald-400 font-bold" };
  }
  if (lbl.includes("BEARISH")) {
    return { badge: "[ BEARISH ]", class: "text-red-400 font-bold" };
  }
  return { badge: "[ NEUTRAL ]", class: "text-slate-400 dark:text-neutral-500" };
}

export default function MarketNewsFeed() {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    async function loadNews() {
      try {
        setStatus("loading");
        const res = await fetchWithFallback("marketNews", NEWS_ENDPOINT, TRANSFORMERS.news, 1200000, STATIC_NEWS_FALLBACK);
        if (active) {
          setNews(res.data || []);
          setStatus(res.status);
        }
      } catch (err) {
        console.error("News load error:", err);
        if (active) {
          setNews(STATIC_NEWS_FALLBACK);
          setStatus("fallback");
        }
      }
    }
    loadNews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="b-panel bg-slate-50 dark:bg-neutral-950/40 rounded-xl p-5 mt-6 font-mono">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-900 pb-3 mb-4">
        <div>
          <div className="t2 tracking-widest">LIVE MARKET FEED // SENTIMENT STREAM</div>
          <div className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase mt-0.5">Real-Time News Analytics & Sentiment Tracking</div>
        </div>
        <div className="text-[9px] px-2.5 py-0.5 rounded border border-neutral-850 bg-slate-50 dark:bg-black/40 text-slate-400 dark:text-neutral-500 uppercase">
          Status: {status}
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-6 text-xs text-neutral-600">No news streams available at this time.</div>
      ) : (
        <div className="space-y-3.5">
          {news.slice(0, 5).map((item, idx) => {
            const sentiment = getSentimentStyle(item.overall_sentiment_label);
            return (
              <div key={idx} className="b-panel bg-slate-50 dark:bg-black/20 rounded-xl p-4 transition-all duration-200 hover:border-slate-300 dark:border-neutral-800">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className={`text-[10px] tracking-wider ${sentiment.class}`}>
                    {sentiment.badge}
                  </span>
                  <span className="text-[10px] text-neutral-600">|</span>
                  <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase">{item.source}</span>
                  <span className="text-[10px] text-neutral-600">|</span>
                  <span className="text-[9px] text-slate-400 dark:text-neutral-500 tabular-nums">{formatNewsTime(item.time_published)}</span>
                </div>
                
                <h4 className="text-xs font-bold leading-snug">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white hover:text-emerald-400 transition-colors">
                    {item.title}
                  </a>
                </h4>
                
                <p className="t3 mt-1.5 leading-relaxed text-neutral-450">
                  {item.summary}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
