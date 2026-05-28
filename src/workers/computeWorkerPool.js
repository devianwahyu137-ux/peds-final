// src/workers/computeWorkerPool.js
// Manages a pool of 2 dedicated compute workers
// Worker 1: Monte Carlo path simulation
// Worker 2: Efficient Frontier generation
// Supports cancellation tokens and streaming progress updates

const WORKER_URLS = {
  monteCarlo: new URL('./monteCarloWorker.js', import.meta.url),
  frontier:   new URL('./frontierWorker.js',   import.meta.url),
};

class ComputeWorkerPool {
  constructor() {
    this.workers        = {};
    this.pendingJobs    = new Map(); // jobId → { resolve, reject, onProgress }
    this.cancelTokens   = new Set(); // jobIds that have been cancelled
    this.jobCounter     = 0;
  }

  // Get or create a worker for the given type
  getWorker(type) {
    if (!this.workers[type] || this.workers[type].dead) {
      const worker = new Worker(WORKER_URLS[type], { type: 'module' });

      worker.onmessage = (event) => {
        const { jobId, type: msgType, progress, result, error } = event.data;

        if (!jobId || !this.pendingJobs.has(jobId)) return;
        if (this.cancelTokens.has(jobId)) {
          this.pendingJobs.delete(jobId);
          this.cancelTokens.delete(jobId);
          return;
        }

        const job = this.pendingJobs.get(jobId);

        if (msgType === 'PROGRESS' && job.onProgress) {
          job.onProgress(progress);
        } else if (msgType === 'COMPLETE') {
          this.pendingJobs.delete(jobId);
          job.resolve(result);
        } else if (msgType === 'ERROR') {
          this.pendingJobs.delete(jobId);
          job.reject(new Error(error));
        }
      };

      worker.onerror = (err) => {
        // Reject all pending jobs for this worker
        this.pendingJobs.forEach((job, jid) => {
          job.reject(new Error(`Worker error: ${err.message}`));
          this.pendingJobs.delete(jid);
        });
        this.workers[type].dead = true;
      };

      this.workers[type] = worker;
    }
    return this.workers[type];
  }

  // Submit a job to a specific worker type
  // Returns { promise, cancel }
  submit(workerType, payload, onProgress = null) {
    const jobId  = ++this.jobCounter;
    const worker = this.getWorker(workerType);

    const promise = new Promise((resolve, reject) => {
      this.pendingJobs.set(jobId, { resolve, reject, onProgress });
    });

    // Use transferable ArrayBuffers for zero-copy transfer where possible
    worker.postMessage({ jobId, payload }, []);

    const cancel = () => {
      this.cancelTokens.add(jobId);
      this.pendingJobs.delete(jobId);
    };

    return { promise, cancel, jobId };
  }

  // Terminate all workers — call on app unmount
  terminate() {
    Object.values(this.workers).forEach(w => {
      try { w.terminate(); } catch {}
    });
    this.workers       = {};
    this.pendingJobs.clear();
    this.cancelTokens.clear();
  }
}

// Singleton pool — shared across all hook instances
export const workerPool = new ComputeWorkerPool();
