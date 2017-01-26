const assert = require("assert");

const {Semaphore} = require("ringo/concurrent");
const {WorkerPool} = require("../lib/workerpool");

exports.testWorkerPool = function() {
    const sem = new Semaphore(0);
    let pool = new WorkerPool(module.resolve("./test-workerpool"), 5, function(event) {
        assert.isTrue(event.data.count > 0);
    }, function(error) {
        assert.fail("Error! " + error);
    });

    assert.strictEqual(pool.postMessage({ "count": 1, "sem": sem }, true), 0);
    assert.strictEqual(pool.postMessage({ "count": 2, "sem": sem }, true), 1);
    assert.strictEqual(pool.postMessage({ "count": 3, "sem": sem }, true), 2);
    assert.strictEqual(pool.postMessage({ "count": 4, "sem": sem }, true), 3);
    assert.strictEqual(pool.postMessage({ "count": 5, "sem": sem }, true), 4);
    assert.strictEqual(pool.postMessage({ "count": 6, "sem": sem }, true), 0);
    assert.strictEqual(pool.postMessage({ "count": 7, "sem": sem }, true), 1);

    if (!sem.tryWait(250, 7)) {
        assert.fail("Semaphore timed out!");
    }
};

const onmessage = function(event) {
    assert.isNotNull(event.data.sem);
    event.source.postMessage({ "count": event.data.count });
    event.data.sem.signal();
};


if (require.main === module) {
    require("system").exit(require("test").run(exports));
}
