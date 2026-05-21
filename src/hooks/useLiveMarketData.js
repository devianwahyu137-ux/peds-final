import { useEffect } from "react";
import { useDataStore } from "../stores/alphaShieldStore";
import { fetchWithFallback } from "../lib/apiFetcher";
import { buildLiveEngineParams } from "../lib/macroMappings";
import { runMPTEngine } from "../lib/mptEngine";

// Transformers for data normalization
const fredTransformer = (data) => {
  if (data?.observations?.length) {
    const val = parseFloat(data.observations[data.observations.length - 1].value);
    if (!isNaN(val)) return val;
  }
  throw new Error("FRED invalid data");
};

const avExchangeRateTransformer = (data) => {
  const rate = data?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];
  if (rate) return parseFloat(rate);
  throw new Error("AV Exchange Rate invalid data");
};

const avQuoteTransformer = (data) => {
  const price = data?.["Global Quote"]?.["05. price"];
  if (price) return parseFloat(price);
  throw new Error("AV Quote invalid");
};

const biRateTransformer = (data) => {
  if (data && typeof data.value === "number") return data.value;
  if (data && data.value) return parseFloat(data.value);
  throw new Error("BI Rate invalid data");
};

const cpiTransformer = (data) => {
  if (data && typeof data.value === "number") return data.value;
  if (data && data.value) return parseFloat(data.value);
  throw new Error("CPI Inflation invalid data");
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function useLiveMarketData() {
  const store = useDataStore();
  const { liveData, scenarioId, targetWeights, actualWeights, setLiveMetric, setEndpointStatus, macroInputs } = store;

  useEffect(() => {
    const fetchAndStore = async (key, url, transformer, ttlMs) => {
      try {
        setEndpointStatus(key, "fetching");
        const res = await fetchWithFallback(key, url, transformer, ttlMs);
        setLiveMetric(key, res.data);
        setEndpointStatus(key, res.status);
      } catch (e) {
        console.error(`Failed fetching ${key}:`, e);
        setEndpointStatus(key, "failed");
      }
    };

    // FRED fetcher (gs10, dxy, fedFunds) - 15 mins
    const runFredFetch = () => {
      fetchAndStore("gs10", "https://api.stlouisfed.org/fred/series/observations?series_id=GS10&api_key=demo&file_type=json", fredTransformer, 900000);
      fetchAndStore("dxy", "https://api.stlouisfed.org/fred/series/observations?series_id=DTWEXBGS&api_key=demo&file_type=json", fredTransformer, 900000);
      fetchAndStore("fedFunds", "https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=demo&file_type=json", fredTransformer, 900000);
    };

    // Alpha Vantage sequential fetcher (usdIdr, xauUsd, ihsg) - 10 mins with 12s delay
    const runAvFetch = async () => {
      await fetchAndStore("usdIdr", "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=IDR&apikey=demo", avExchangeRateTransformer, 600000);
      await delay(12000);
      await fetchAndStore("xauUsd", "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=demo", avExchangeRateTransformer, 600000);
      await delay(12000);
      await fetchAndStore("ihsg", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=^JKSE&apikey=demo", avQuoteTransformer, 600000);
    };

    // Domestic fetcher (biRate, cpi) - 1 hour
    const runDomesticFetch = () => {
      fetchAndStore("biRate", "https://laquzixkcxeswmlhsnxp.supabase.co/functions/v1/bi-rate-proxy", biRateTransformer, 3600000);
      fetchAndStore("cpi", "https://laquzixkcxeswmlhsnxp.supabase.co/functions/v1/cpi-inflation-proxy", cpiTransformer, 3600000);
    };

    // Fallbacks for missing assets to trigger their default parameters
    const runOthers = () => {
      fetchAndStore("sbnYield10Y", "", null, 3600000);
      fetchAndStore("inflasiTrend", "", null, 3600000);
      fetchAndStore("emasTrend", "", null, 3600000);
    };

    // Initial load execution
    runFredFetch();
    runAvFetch();
    runDomesticFetch();
    runOthers();

    // Setup background intervals
    const fredInterval = setInterval(runFredFetch, 900000);
    const avInterval = setInterval(runAvFetch, 600000);
    const domesticInterval = setInterval(runDomesticFetch, 3600000);

    return () => {
      clearInterval(fredInterval);
      clearInterval(avInterval);
      clearInterval(domesticInterval);
    };
  }, [setLiveMetric, setEndpointStatus]);

  // Automated listener loop to update central store analytics state when liveData streams arrive
  useEffect(() => {
    if (!liveData.dxy || !liveData.biRate) return;

    const liveParams = buildLiveEngineParams(liveData);

    const decMacro = {
      biRate: (liveData.biRate || macroInputs.biRate || 0) / 100,
      inflation: (liveData.cpi || liveData.inflation || macroInputs.inflation || 0) / 100,
      usdIdr: liveData.usdIdr ? (liveData.usdIdr / 1000) : (macroInputs.usdIdr || 0),
      sbn10y: (liveData.sbnYield10Y || macroInputs.sbn10y || 0) / 100,
      dxy: liveData.dxy || macroInputs.dxy || 0,
      
      // Inject DXY live multipliers
      dxyEquityAdj: liveParams.dxyEquityAdj,
      dxyBondsAdj: liveParams.dxyBondsAdj,
      dxyGoldAdj: liveParams.dxyGoldAdj,
      dxyCashAdj: liveParams.dxyCashAdj,
    };

    const decWeightsTarget = {
      stocks: (targetWeights.stocks || 0) / 100,
      bonds: (targetWeights.bonds || 0) / 100,
      gold: (targetWeights.gold || 0) / 100,
      cash: (targetWeights.cash || 0) / 100
    };

    const decWeightsActual = {
      stocks: (actualWeights.stocks || 0) / 100,
      bonds: (actualWeights.bonds || 0) / 100,
      gold: (actualWeights.gold || 0) / 100,
      cash: (actualWeights.cash || 0) / 100
    };

    const targetAnalytics = runMPTEngine(decWeightsTarget, scenarioId, decMacro);
    const actualAnalytics = runMPTEngine(decWeightsActual, scenarioId, decMacro);

    useDataStore.setState({
      targetAnalytics,
      actualAnalytics,
      analytics: {
        target: targetAnalytics,
        actual: actualAnalytics
      }
    });
  }, [liveData, scenarioId, targetWeights, actualWeights, macroInputs]);

  return { liveData };
}
