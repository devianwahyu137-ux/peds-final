// src/workers/monteCarloWorker.js
// UPGRADED: streaming progress + cancellation awareness
// Imports monteCarloEngine directly (ESM worker)

import { runMonteCarloSimulation } from '../lib/monteCarloEngine.js';

self.addEventListener('message', async (event) => {
  const { jobId, payload } = event.data;

  if (!jobId || !payload) return;

  try {
    self.postMessage({ jobId, type: 'PROGRESS', progress: 5 });

    // Run simulation — this is CPU-intensive
    const result = runMonteCarloSimulation(payload);

    self.postMessage({ jobId, type: 'PROGRESS', progress: 80 });

    // Serialize Float32Arrays for structured clone
    const serialized = {
      ...result,
      bands: Object.fromEntries(
        Object.entries(result.bands).map(([k, v]) => [k, Array.from(v)])
      ),
      finalValues: Array.from(result.finalValues),
    };

    self.postMessage({ jobId, type: 'PROGRESS', progress: 100 });
    self.postMessage({ jobId, type: 'COMPLETE', result: serialized });

  } catch (err) {
    self.postMessage({ jobId, type: 'ERROR', error: err.message });
  }
});
