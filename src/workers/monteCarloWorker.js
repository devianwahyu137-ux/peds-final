import { runMonteCarloSimulation } from '../lib/monteCarloEngine.js';

self.onmessage = (event) => {
  const payload = event.data;
  if (!payload) return;

  try {
    // Process the heavy iterative Geometric Brownian Motion (GBM) loop
    const result = runMonteCarloSimulation(payload);

    // Serialize Float32Arrays for structured clone compatibility
    const serialized = {
      ...result,
      bands: Object.fromEntries(
        Object.entries(result.bands).map(([k, v]) => [k, Array.from(v)])
      ),
      finalValues: Array.from(result.finalValues),
    };

    // postMessage the final results (median, P95, P5, loss prob, and chart data points)
    self.postMessage({ type: 'SUCCESS', result: serialized });
  } catch (err) {
    self.postMessage({ type: 'ERROR', error: err.message });
  }
};
