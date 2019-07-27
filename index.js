var uuid = 0;

function stableSort(arr, compare) {
  var wrapper = arr.map(function (item, idx) {
    return { item: item, idx: idx };
  });

  wrapper.sort(function (a, b) {
    return compare(a.item, b.item) || (a.idx - b.idx);
  });

  return wrapper.map(function (w) {
    return w.item
  });
}

function randomPosition(arr) {
  return Math.floor(Math.random() * arr.length);
}

function removeRandom(arr) {
  var i = randomPosition(arr);
  var taskId = arr[i];
  arr.splice(i, 1);
  return taskId;
}

function RandomAccessMemoryStore() {
  this._queue = [];      // Array of taskIds
  this._tasks = {};      // Map of taskId => task
  this._priorities = {}; // Map of taskId => priority
  this._running = {};    // Map of lockId => taskIds
}

RandomAccessMemoryStore.prototype.connect = function (cb) {
  cb(null, this._queue.length);
};

RandomAccessMemoryStore.prototype.getTask = function (taskId, cb) {
  return cb(null, this._tasks[taskId]);
};

RandomAccessMemoryStore.prototype.deleteTask = function (taskId, cb) {
  var self = this;
  var hadTask = self._tasks[taskId];
  delete self._tasks[taskId];
  delete self._priorities[taskId];
  if (hadTask) {
    self._queue.splice(self._queue.indexOf(taskId), 1);
  }
  cb();
};

RandomAccessMemoryStore.prototype.putTask = function (taskId, task, priority, cb) {
  var self = this;
  var hadTask = self._tasks[taskId];
  self._tasks[taskId] = task;
  if (!hadTask) {
    self._queue.push(taskId);
  }
  if (priority !== undefined) {
    self._priorities[taskId] = priority;
    self._queue = stableSort(self._queue, function (a, b) {
      if (self._priorities[a] < self._priorities[b]) return 1;
      if (self._priorities[a] > self._priorities[b]) return -1;
      return 0;
    })
  }
  cb();
};

function takeRandom(n, cb) {
  var self = this;
  var lockId = uuid++;

  var tasks = {};
  var taskIds = [];

  for (var i = 0; i < n; i++) {
    if (this._queue.length <= 0) {
      break;
    }
    var taskId = removeRandom(this._queue);
    tasks[taskId] = self._tasks[taskId];
    taskIds.push(taskId);
    delete self._tasks[taskId];
  }

  if (taskIds.length > 0) {
    self._running[lockId] = tasks;
  }

  cb(null, lockId);
}

RandomAccessMemoryStore.prototype.takeFirstN = takeRandom;

RandomAccessMemoryStore.prototype.takeLastN = takeRandom;

RandomAccessMemoryStore.prototype.getLock = function (lockId, cb) {
  var self = this;
  cb(null, self._running[lockId]);
};

RandomAccessMemoryStore.prototype.getRunningTasks = function (cb) {
  var self = this;
  cb(null, self._running);
};

RandomAccessMemoryStore.prototype.releaseLock = function (lockId, cb) {
  var self = this;
  delete self._running[lockId];
  cb();
};

module.exports = RandomAccessMemoryStore;
