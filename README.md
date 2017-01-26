# workerpool
A Worker pool for RingoJS.

## Example

**Simple server-side analytics:** The following script creates a pool of 5 analytics log writers. Each request is logged
async by one of these log writers in a separate thread. The pool takes care that each
call gets distributed round-robin over the 5 workers.

```javascript
const pool = module.singleton("pool", function() {
   return new WorkerPool(module.resolve("./analytics-logger"), 5);
});

app.get("/", function(req) {
    // track a page impression
    pool.postMessage({
       agent: req.headers["user-agent"] || "",
       ip: req.remoteAddress
    });
});
```

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
