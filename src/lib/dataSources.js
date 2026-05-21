const AV_API_KEY = "demo";
export const NEWS_ENDPOINT = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL,MSFT&apikey=${AV_API_KEY}`;

export const TRANSFORMERS = {
  news: (data) => {
    if (data && Array.isArray(data.feed)) {
      return data.feed.map(item => ({
        title: item.title || "",
        summary: item.summary || "",
        url: item.url || "",
        source: item.source || "",
        banner_image: item.banner_image || "",
        overall_sentiment_label: item.overall_sentiment_label || "Neutral",
        time_published: item.time_published || ""
      }));
    }
    throw new Error("Invalid AV News Sentiment feed format");
  }
};
