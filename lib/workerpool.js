const {Worker} = require("ringo/worker");

/**
 * Creates a new WorkerPool of the given size.
 * @type {WorkerPool}
 * @oaram {string} moduleId id of the module to load in the worker
 * @param {number} size initial number of workers in the pool
 * @param {function} onmessageCallback optional onmessage callback to listen to events back from a worker of the pool
 * @param {function} onerrorCallback optional onerror callback to listen to events back from a worker of the pool
 */
const WorkerPool = exports.WorkerPool = function(moduleId, size, onmessageCallback, onerrorCallback) {
    if (typeof moduleId !== "string") {
        throw new Error("Invalid worker module id!");
    }

    if (typeof size !== "number" || size < 1) {
        throw new Error("Invalid worker pool size!");
    }

    const workerPointer = java.util.concurrent.atomic.AtomicInteger(0);
    const pool = [];

    for (let i = 0; i < size; i++) {
        let worker = new Worker(moduleId);

        // Wire the callbacks
        if (typeof onmessageCallback === "function") {
            worker.onmessage = onmessageCallback;
        }
        if (typeof onerrorCallback === "function") {
            worker.onerror = onerrorCallback;
        }

        pool.push(worker);
    }

    /**
     * Posts a message to one of the pool's workers and returns.
     * @param {object} data the data to pass to the worker
     * @param {boolean} syncCallbacks if true, callbacks from the worker are called synchronously
     * @returns {number} the internal id of the selected worker
     */
    this.postMessage = function(data, syncCallbacks) {
        const pos = Math.abs(workerPointer.getAndIncrement()) % pool.length;
        pool[pos].postMessage(data, syncCallbacks);
        return pos;
    };
};
