// src/workers/frontierWorker.js
// Dedicated worker for Efficient Frontier generation
// Separated from Monte Carlo to allow parallel computation

import { generateFrontierPoints } from '../lib/monteCarloEngine.js';

self.addEventListener('message', (event) => {
  const { jobId, payload } = event.data;
  if (!jobId) return;

  try {
    self.postMessage({ jobId, type: 'PROGRESS', progress: 10 });

    const { expectedReturns, covMatrix, numPoints = 400 } = payload;

    if (!expectedReturns || !covMatrix) {
      throw new Error('Missing expectedReturns or covMatrix');
    }

    self.postMessage({ jobId, type: 'PROGRESS', progress: 30 });

    const points = generateFrontierPoints(expectedReturns, covMatrix, numPoints);

    self.postMessage({ jobId, type: 'PROGRESS', progress: 90 });
    self.postMessage({ jobId, type: 'COMPLETE', result: points });

  } catch (err) {
    self.postMessage({ jobId, type: 'ERROR', error: err.message });
  }
});
