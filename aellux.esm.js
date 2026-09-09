const root =
  typeof globalThis !== "undefined"
    ? globalThis
    : window;
const Aellux = root.Aellux || {};
const modulePromises = {};

Object.assign(Aellux, {
  initModule: function () {
    Aellux.wait("defaultAdaptiveCSSPromise").then(() => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", Aellux.adaptiveObserverUpdate, { once: true });
      } else {
        Aellux.adaptiveObserverUpdate();
      }
    });
    setupAllModules().catch(error => {
      console.error(
        "[Aellux] Module initialization failed.",
        error
      );
    });
  },

  kill: function () {
    //document.removeEventListener("AelluxUpdateDOM", setupAllModules);
    Aellux.adaptiveObserver.disconnect();
  },

  on: function (event, handler, options) {
    document.addEventListener(`Aellux${event}`, handler, options);
  },

  off: function (event, handler, options) {
    document.removeEventListener(`Aellux${event}`, handler, options);
  },

  wait: function (moduleName) {
    const key = toCamelCase(moduleName);
    if (key in Aellux)
      return Promise.resolve(Aellux[key]);

    if (modulePromises[moduleName])
      return modulePromises[moduleName];

    return loadUXM(moduleName);
  },

  adaptiveObserver: new ResizeObserver(AdaptiveResizeObserver),
  adaptiveObserverUpdate: function () {
    const adaptives = document.querySelectorAll("[data-aellux-adaptive]");
    adaptives.forEach(adaptive => Aellux.adaptiveObserver.observe(adaptive)); //Safe to call again
  },

  resolve: function (uxm, alias) {
    return Aellux.options.dependencies[uxm][alias];
  },

  layout: createLayoutScheduler(),
});

async function setupAllModules() {
  const allModules = [];
  Aellux.options.load.forEach(mName => allModules.push(
    loadUXM(mName).then(module => {
      if ("init" in module && typeof module.init === "function")
        return module.init();
    })));
  await Promise.all(allModules);
  dispatchReady();
}

function dispatchReady() {
  var event = document.createEvent("Event");
  event.initEvent("AelluxReady", false, false);
  document.dispatchEvent(event);
}

function toCamelCase(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function loadUXM(mName) {
  if (modulePromises[mName])
    return modulePromises[mName];

  modulePromises[mName] =
    import(`./aellux.uxm.${mName}.js`)
      .then(module => {
        const realModule = module.default || module;
        const key = toCamelCase(mName);
        Aellux[key] = realModule;
        return realModule;
      });

  return modulePromises[mName];
}

function AdaptiveResizeObserver(entries) {
  Aellux.layout.update(() => {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      //ARE PARENTS DISPLAYED
      applyAdaptiveClasses(
        entry.target,
        entry.contentRect.width,
        entry.contentRect.height
      );
    }
  });
  Aellux.wait("adaptiveComposition").then((m) => m.update(entries));
}

function applyAdaptiveClasses(element, width, height) {
  const params = Aellux.options.adaptiveParams;
  //RATIO SHAPE
  const ratioBreakpoints = params.ratioShapes;
  const ratio = height > 0 ? width / height : 0;

  element.classList.toggle("ux-shape-vertical", ratio < ratioBreakpoints.vertical);
  element.classList.toggle("ux-shape-horizontal", ratio > ratioBreakpoints.horizontal);
  element.classList.toggle("ux-shape-square",
    ratio >= ratioBreakpoints.vertical &&
    ratio <= ratioBreakpoints.horizontal
  );

  //SPACE SIZE
  const sizes = Object.keys(params.minSizes);
  const spaceBreakpoints = params.minSizes;
  const space = Math.sqrt(width * height);

  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    element.classList.toggle(
      "ux-fits-" + size,
      space >= spaceBreakpoints[size]
    );
  }

  element.setAttribute("data-aellux-ready", "");
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