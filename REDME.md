# Better Queue - Memory Store

Ephemeral store with random access for [better-queue](https://github.com/diamondio/better-queue).

The implementation is based on [Memory Store](https://github.com/diamondio/better-queue-memory)
which is the default store used in the better-queue package. The difference
is that the queued items will be processed in random order.

### First in, last out...

Note that setting the `filo` flag on the queue has no effect when using this store. 

### Getting started

```javascript
var Queue = require('better-queue');
var RandomAccessMemoryStore = require('random-access-memory-store');
 
var q = new Queue(function (input, cb) {
  
  // Some processing here ...
 
  cb(null, result);
}, {
  store: new RandomAccessMemoryStore()
});
``` 
