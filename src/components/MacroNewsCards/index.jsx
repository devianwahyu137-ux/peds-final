import { useState, useEffect } from "react";
import { fetchWithFallback } from "../../lib/apiFetcher";
import { NEWS_ENDPOINT, TRANSFORMERS } from "../../lib/dataSources";
import { DUMMY_NEWS } from "../../lib/dummyNewsData";
import NewsCard from "./NewsCard";

/**
 * Map Alpha Vantage sentiment labels to our internal format.
 */
function normalizeSentiment(label) {
  const lbl = (label || "").toUpperCase();
  if (lbl.includes("BULLISH")) return "BULLISH";
  if (lbl.includes("BEARISH")) return "BEARISH";
  return "NEUTRAL";
}

/**
 * Transform AV news feed items into our NewsCard format.
 */
function transformAvNews(items) {
  return items.map((item, i) => ({
    id: `av-${i}`,
    title: item.title || "",
    source: item.source || "Market Feed",
    publishedAt: item.time_published
      ? new Date(
          item.time_published.replace(
            /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/,
            "$1-$2-$3T$4:$5:$6Z"
          )
        ).toISOString()
      : new Date().toISOString(),
    sentiment: normalizeSentiment(item.overall_sentiment_label),
    sentimentScore: 0.5,
    summary: item.summary || "",
    tags: [],
    url: item.url || "#",
  }));
}

/**
 * MacroNewsCards — Grid of glassmorphic news cards.
 * Attempts live AV news feed, falls back to DUMMY_NEWS.
 */
export default function MacroNewsCards() {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    let isFirstLoad = true;
    let intervalId;

    async function loadNews() {
      try {
        if (isFirstLoad) {
          setStatus("loading");
          isFirstLoad = false;
        }
        const res = await fetchWithFallback(
          "marketNews",
          NEWS_ENDPOINT,
          TRANSFORMERS.news,
          1200000,
          null
        );

        if (!active) return;

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setNews(transformAvNews(res.data));
          setStatus(res.status);
        } else {
          // Gracefully rotate mock data on fetch failure
          setNews([...DUMMY_NEWS].sort(() => Math.random() - 0.5));
          setStatus("simulation");
        }
      } catch {
        if (active) {
          // Gracefully rotate mock data on error
          setNews([...DUMMY_NEWS].sort(() => Math.random() - 0.5));
          setStatus("simulation");
        }
      }
    }

    loadNews();
    
    // Polling mechanism every 60 seconds
    intervalId = setInterval(() => {
      loadNews();
    }, 60000);

    return () => { 
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="card-tier-2 mt-6 font-mono">
      <div className="flex items-center justify-between border-b border-slate-300 dark:border-neutral-800/50 pb-3 mb-4">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-400 uppercase">
            MACRO NEWS FEED // SENTIMENT STREAM
          </div>
          <div className="text-[9px] text-neutral-600 uppercase mt-0.5">
            Real-Time News Analytics & Sentiment Tracking
          </div>
        </div>
        <div className="text-[9px] px-2.5 py-0.5 rounded border border-slate-300 dark:border-neutral-800 bg-slate-50 dark:bg-black/40 text-slate-400 dark:text-neutral-500 uppercase font-mono">
          {status}
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-6 text-xs text-neutral-600">
          No news streams available at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {news.slice(0, 6).map((item) => (
            <NewsCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
