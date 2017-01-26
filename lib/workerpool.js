const {Worker} = require("ringo/worker");

/**
 * Creates a new WorkerPool of the given size. Set `onmessage`/`onerror`
 * properties of a WorkerPool instance to receive messages resp. errors from
 * the pool workers.
 * @type {WorkerPool}
 * @oaram {string} moduleId id of the module to load in the worker
 * @param {number} size initial number of workers in the pool
 */
const WorkerPool = module.exports = function(moduleId, size) {
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

        worker.onmessage = (function(event) {
            if (typeof this.onmessage === "function") {
                this.onmessage(event);
            }
        }).bind(this);
        worker.onerror = (function(error) {
            if (typeof this.onerror === "function") {
                this.onerror(event);
            }
        }).bind(this);

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
