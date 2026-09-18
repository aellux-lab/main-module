/*! Aellux | SPDX-License-Identifier: Apache-2.0 | See LICENSE for terms. */
const root = typeof globalThis !== "undefined" ? globalThis : window;
const modulePromises = {};
root.Aellux = Object.assign(AelluxForceUpdate, root.Aellux, {
  async initModuleLoader() {
    const allModules = [];
    Aellux.options.load.forEach((mName) => allModules.push(
      loadUXM(mName).then((module) => {
        if ("init" in module && typeof module.init === "function" && "destroy" in module && typeof module.destroy === "function")
          return module.init();
      }).catch((error) => {
        console.error(
          `[Aellux] UX module "${mName}" failed to initialize.`,
          error
        );
      })
    ));
    await Promise.all(allModules);
    Aellux.dispatch("Ready");
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          Aellux.update();
        },
        { once: true }
      );
    } else {
      Aellux.update();
    }
    return true;
  },
  update(root2) {
    AelluxForceUpdate(root2);
  },
  unmount(root2) {
    AelluxForceUnmount(root2);
  },
  destroy() {
    Aellux.observers.resize.disconnect();
    Aellux.observers.mutation.disconnect();
    Aellux.observers.intersection.disconnect();
  },
  dispatchFrom(from, event, options) {
    from.dispatchEvent(new CustomEvent(Aellux.eventName(event), options));
  },
  wait(moduleName) {
    const key = toCamelCase(moduleName);
    if (key in Aellux) {
      return Promise.resolve(Aellux[key]);
    }
    if (modulePromises[key]) {
      return modulePromises[key];
    }
    if (Aellux.options.load.indexOf(moduleName) > -1) {
      return loadUXM(moduleName);
    }
    return Promise.reject();
  },
  observe(element, type) {
    Aellux.observers[type].observe(element);
  },
  unobserve(element, type) {
    Aellux.observers[type].unobserve(element);
  },
  request: defaultRequest,
  observers: Object.freeze({
    resize: new ResizeObserver(resizeObserverCallback),
    mutation: new MutationObserver(mutationObserverCallback),
    intersection: new IntersectionObserver(mutationObserverCallback)
  }),
  waitLayout: createLayoutScheduler()
});
root[root.Aellux.shortJSName] = root.Aellux;
function intersectionObserverCallback(entries) {
  observerCallback(entries, "Intersection");
}
function mutationObserverCallback(entries) {
  observerCallback(entries, "Mutation");
}
function resizeObserverCallback(entries) {
  observerCallback(entries, "Resize");
}
function observerCallback(entries, event) {
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    Aellux.dispatchFrom(entry.target, `${event}Observer`, { detail: entry });
  }
}
function loadUXM(mName) {
  const key = toCamelCase(mName);
  if (modulePromises[key])
    return modulePromises[key];
  const bundledLoader = Aellux.bundledModules?.[mName];
  modulePromises[key] = (bundledLoader ? Promise.resolve().then(() => bundledLoader()) : import(`${Aellux.aelluxBasePath}${Aellux.uxmFilename(mName)}`)).then((module) => {
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
    Promise.resolve().then(function() {
      phase = "update";
      var updates = updateQueue.splice(0);
      for (var i2 = 0; i2 < updates.length; i2++)
        runTask(updates[i2]);
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
    var promise = new Promise(function(resolve, reject) {
      queue.push({
        callback,
        resolve,
        reject
      });
    });
    if (phase === "idle") scheduleFrame();
    return promise;
  }
  return Object.freeze({
    read: (callback) => queueTask(readQueue, callback),
    update: (callback) => queueTask(updateQueue, callback)
  });
}
function defaultRequest(url, options) {
  var requestOptions = Object.assign(
    { method: "GET", credentials: "same-origin" },
    options
  );
  return fetch(url, requestOptions).then(function(response) {
    if (!response.ok) {
      var error = new Error("HTTP " + response.status + " " + response.statusText);
      error.name = "AelluxRequestError";
      error.status = response.status;
      error.statusText = response.statusText;
      error.response = response;
      throw error;
    }
    return response;
  }).catch(function(error) {
    throw error;
  });
}
;
function AelluxForceUpdate(root2) {
  return AelluxForce(root2, "update");
}
function AelluxForceUnmount(root2) {
  return AelluxForce(root2, "unmount");
}
function AelluxForce(root2, method) {
  resolveRoots(root2).forEach((rootElement) => {
    Aellux.options.load.forEach((mName) => {
      const key = toCamelCase(mName);
      const mounter = Aellux[key]?.mountDOM ?? null;
      if (!mounter) return;
      for (const [attr, controller] of mounter) {
        if (!(method in controller)) continue;
        const elements = findElements(rootElement, attr);
        elements.forEach((currentElement) => {
          try {
            Promise.resolve(controller[method](currentElement)).catch((error) => console.error(error));
          } catch (error) {
            console.error(error);
          }
        });
      }
    });
  });
}
function resolveRoots(root2) {
  if (!root2) {
    return [document];
  }
  if (typeof root2 === "string") {
    try {
      return Array.from(document.querySelectorAll(root2));
    } catch (error) {
      return [];
    }
  }
  if (root2 instanceof Element || root2 instanceof Document || root2 instanceof DocumentFragment) {
    return [root2];
  }
  return [];
}
function findElements(root2, selector) {
  const elements = [];
  if (root2.nodeType === Node.ELEMENT_NODE && root2.matches(selector)) {
    elements.push(root2);
  }
  if (root2.querySelectorAll) {
    root2.querySelectorAll(selector).forEach(function(element) {
      elements.push(element);
    });
  }
  return elements;
}
function toCamelCase(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
;
function fromCamelCase(name) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}
;
let pageWasHidden = false;
window.addEventListener("pagehide", () => pageWasHidden = true);
window.addEventListener("pageshow", (event) => {
  if (event.persisted && pageWasHidden) {
    pageWasHidden = false;
  }
});
//# sourceMappingURL=aellux.orchestrator.mjs.map
