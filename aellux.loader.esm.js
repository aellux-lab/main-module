const root =
  typeof globalThis !== "undefined"
    ? globalThis
    : window;
const modulePromises = {};

root.Aellux = Object.assign(AelluxMethod, root.Aellux, {
  initModule: function () {
    return setupAllModules()
      .catch(error => {
        console.error(
          "[Aellux] Module initialization failed.",
          error
        );
      });
  },

  kill: function () {
    Aellux.observers.resize.disconnect();
    Aellux.observers.mutation.disconnect();
    Aellux.observers.intersection.disconnect();
  },

  dispatch(event, options) { Aellux.dispatchFrom(document, event, options); },
  dispatchFrom(from, event, options) {
    console.log(`dispatch: Aellux${event}`, options);
    from.dispatchEvent(new CustomEvent(Aellux.eventName(event), options));
  },

  wait(moduleName) {
    const key = toCamelCase(moduleName);
    if (key in Aellux) { return Promise.resolve(Aellux[key]); }
    if (modulePromises[key]) { return modulePromises[key]; }
    if (Aellux.options.load.indexOf(moduleName) > -1) { return loadUXM(moduleName); }
    return Promise.reject()
  },

  observe(element, type) {
    Aellux.observers[type].observe(element);
  },

  observers: {
    resize: new ResizeObserver(resizeObserverCallback),
    mutation: new MutationObserver(mutationObserverCallback),
    intersection: new IntersectionObserver(mutationObserverCallback)
  },

  waitLayout: createLayoutScheduler(),
});
root.$A = root.Aellux;

function intersectionObserverCallback(entries) { observerCallback(entries, "Intersection"); }
function mutationObserverCallback(entries) { observerCallback(entries, "Mutation"); }
function resizeObserverCallback(entries) { observerCallback(entries, "Resize"); }
function observerCallback(entries, event) {
  //Definir um intervalo em MS para rodar apenas a alteração mais recente
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    Aellux.dispatchFrom(entry.target, `${event}Observer`, { detail: entry });
  }
}

async function setupAllModules() {
  const allModules = [];
  Aellux.options.load.forEach(mName => allModules.push(
    loadUXM(mName).then(module => {
      if ("init" in module && typeof module.init === "function")
        return module.init();
    })));
  await Promise.all(allModules);
  Aellux.dispatch("Ready");
}

function loadUXM(mName) {
  const key = toCamelCase(mName);

  if (modulePromises[key])
    return modulePromises[key];

  modulePromises[key] =
    import(`${Aellux.aelluxBasePath}${Aellux.uxmFilename(mName)}`)
      .then(module => {
        const realModule = module.default || module;
        Aellux[key] = realModule;
        return realModule;
      });

  return modulePromises[key];
}

function createLayoutScheduler() {
  var readQueue = [];
  var updateQueue = [];

  var framePending = false;
  var phase = "idle";

  function scheduleFrame() {
    if (framePending || phase !== "idle") return;
    framePending = true;
    requestAnimationFrame(flushFrame);
  }

  function flushFrame() {
    framePending = false;

    phase = "read";
    var reads = readQueue.splice(0);
    for (var i = 0; i < reads.length; i++)
      runTask(reads[i]);

    Promise.resolve().then(function () {
      phase = "update";
      var updates = updateQueue.splice(0);
      for (var i = 0; i < updates.length; i++)
        runTask(updates[i]);

      phase = "idle";
      if (readQueue.length || updateQueue.length) scheduleFrame();
    });
  }

  function runTask(task) {
    try {
      task.resolve(task.callback());
    } catch (error) {
      task.reject(error);
    }
  }

  function queueTask(queue, callback) {
    var promise = new Promise(function (resolve, reject) {
      queue.push({
        callback: callback,
        resolve: resolve,
        reject: reject
      });
    });

    if (phase === "idle") scheduleFrame();
    return promise;
  }

  return {
    read: (callback) => queueTask(readQueue, callback),
    update: (callback) => queueTask(updateQueue, callback)
  };
}

function AelluxMethod(element) {
  // if (element) {
  //   return Aellux.update(element);
  // }

  console.log("TESTE");

  return Aellux;
}

function toCamelCase(name) { return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); };
function fromCamelCase(name) { return name.replace(/([A-Z])/g, "-$1").toLowerCase(); };