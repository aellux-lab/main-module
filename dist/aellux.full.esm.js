var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/aellux.uxm.preferences.js
var aellux_uxm_preferences_exports = {};
__export(aellux_uxm_preferences_exports, {
  destroy: () => destroy,
  get: () => get,
  init: () => init,
  set: () => set,
  update: () => update
});
async function init() {
  window.addEventListener("storage", function(event) {
    if (event.key !== "AelluxPreferences") return;
    const newPreferences = new URLSearchParams(event.newValue || "");
    newPreferences.forEach((value, key) => userPreferences[key] = value);
    update();
  });
  const allQueries = Aellux.options.preferencesMediaQueries;
  Object.values(allQueries).forEach(
    (queries) => Object.values(queries).forEach(
      (query) => query.addEventListener("change", update)
    )
  );
  Object.entries(Aellux.options.preferencesOptions).forEach(([param, options]) => defaultPreferences[param] = options[0]);
  loadUserPreferences();
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      update,
      { once: true }
    );
  } else {
    update();
  }
}
async function destroy() {
}
function update() {
  Object.assign(computedPreferences, defaultPreferences, userPreferences);
  Aellux.updatePreferencesAttributesHTML(computedPreferences);
  preferenceContainersUpdate();
  Aellux.dispatch("PreferencesChange");
}
function get(preference) {
  const key = toCamelCase2(preference);
  return computedPreferences[key];
}
function set(preference, value) {
  const key = toCamelCase2(preference);
  if (userPreferences[key] === value) return;
  userPreferences[key] = value;
  saveUserPreferences();
}
function saveUserPreferences() {
  Aellux.persist.preferences.setObject(userPreferences);
}
function loadUserPreferences() {
  Object.assign(userPreferences, Aellux.persist.preferences.getObject());
}
function preferenceContainersUpdate() {
  document.querySelectorAll(`[${attr.preference}]`).forEach((container) => {
    const ready = container.getAttribute(attr.ready);
    if (!ready) {
      setupPreferenceContainer(container);
    }
    const preference = container.getAttribute(attr.preference);
    const elements = container.querySelectorAll(`[${attr.option}]`);
    const selectedLabel = container.querySelector(`[${attr.label}]`);
    elements.forEach((element) => {
      const value = element.getAttribute(attr.option);
      const selected = value === get(preference);
      element.classList.toggle(className.active, selected);
      if (selectedLabel && selected) {
        if (selectedLabel.value) {
          selectedLabel.value = element.innerText;
        } else {
          selectedLabel.innerHTML = element.innerHTML;
        }
      }
    });
  });
}
function setupPreferenceContainer(container) {
  container.addEventListener("click", onContainerClick);
  container.setAttribute(attr.ready, "");
}
function onContainerClick(event) {
  const container = event.currentTarget;
  const optionButton = event.target?.closest(`[${attr.option}]`) ?? null;
  const buttonNext = event.target?.closest(`[${attr.next}]`) ?? null;
  const buttonPrev = event.target?.closest(`[${attr.prev}]`) ?? null;
  if (optionButton) {
    const preference = container.getAttribute(attr.preference);
    const value = optionButton.getAttribute(attr.option);
    set(preference, value);
    update();
  } else if (buttonNext || buttonPrev) {
    const preference = container.getAttribute(attr.preference);
    const change2 = buttonNext ? 1 : -1;
  }
}
function toCamelCase2(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
var userPreferences, defaultPreferences, computedPreferences, attr, className;
var init_aellux_uxm_preferences = __esm({
  "src/aellux.uxm.preferences.js"() {
    "use strict";
    userPreferences = /* @__PURE__ */ Object.create(null);
    defaultPreferences = /* @__PURE__ */ Object.create(null);
    computedPreferences = /* @__PURE__ */ Object.create(null);
    attr = {
      preference: Aellux.attr("preference"),
      option: Aellux.attr("option"),
      label: Aellux.attr("label"),
      next: Aellux.attr("next"),
      prev: Aellux.attr("prev"),
      ready: Aellux.attr("ready")
    };
    className = {
      active: Aellux.className("active")
    };
  }
});

// src/aellux.uxm.state-navigation.js
var aellux_uxm_state_navigation_exports = {};
__export(aellux_uxm_state_navigation_exports, {
  ajaxHref: () => ajaxHref,
  destroy: () => destroy2,
  flowStep: () => flowStep,
  formUpdate: () => formUpdate,
  globalSnapshot: () => globalSnapshot,
  init: () => init2,
  normalize: () => normalize,
  tabOpen: () => tabOpen,
  updateBaseTitle: () => updateBaseTitle
});
function init2() {
  window.addEventListener("popstate", onPopState);
  window.addEventListener("hashchange", onHashChange);
  useHash = Aellux.options.useHash ?? useHash;
  baseTitle = document.title;
  onHashChange();
  history.replaceState({
    aelluxState: true,
    snapshot: { ...globalSnapshot }
  }, "");
}
async function destroy2() {
  window.removeEventListener("popstate", onPopState);
  window.removeEventListener("hashchange", onHashChange);
}
function updateBaseTitle(title) {
}
function tabOpen(tabGroupId, tabId, title) {
  return change(tabGroupId, tabId, title);
}
function ajaxHref(url, selectors) {
  history.replaceState({ aelluxState: true, snapshot: globalSnapshot, ajaxHref: selectors }, "", window.location.href);
  updateSnapshotData();
  history.pushState({ aelluxState: true, snapshot: null, ajaxHref: selectors }, "", url);
}
function flowStep(flowId, step, options) {
}
function formUpdate(formId, event, value, options) {
}
function normalize(key, value, title = void 0, silent) {
  return change(key, value, title, silent);
}
async function change(key, value, title, silent = false) {
  if (globalSnapshot.title === title && globalSnapshot[key] === value) return;
  if (title) globalSnapshot.title = title.replace(/\s+/g, " ");
  else delete globalSnapshot.title;
  globalSnapshot[key] = value;
  updateSnapshotData(snapshotToString(globalSnapshot));
  const state = { aelluxState: true, snapshot: { ...globalSnapshot } };
  const url = useHash ? `#${globalSnapshotString}` : void 0;
  if (silent) history.replaceState(state, "", url);
  else history.pushState(state, "", url);
  dispatchSnapshotEvent("SnapshotChange");
}
function updateSnapshotData(string) {
  globalSnapshotString = string;
  for (const key in globalRemoveSnapshot) {
    delete globalRemoveSnapshot[key];
  }
  Object.assign(globalRemoveSnapshot, globalSnapshot);
  for (const key in globalSnapshot) {
    delete globalSnapshot[key];
  }
  new URLSearchParams(string).forEach((value, key) => globalSnapshot[key] = value);
  for (const key in globalRemoveSnapshot) {
    if (key in globalSnapshot) {
      delete globalRemoveSnapshot[key];
    }
  }
}
function snapshotToString(snapshot) {
  return new URLSearchParams(snapshot || {}).toString();
}
function dispatchSnapshotEvent(name) {
  document.title = globalSnapshot.title || false ? `${globalSnapshot.title} - ${baseTitle}` : baseTitle;
  const options = {
    detail: {
      snapshot: globalSnapshot,
      removeSnapshot: globalRemoveSnapshot
    },
    bubbles: true
  };
  Aellux.dispatch(name, options);
}
function dispatchEventRestore() {
  return dispatchSnapshotEvent("SnapshotRestore");
}
function onHashChange() {
  if (!useHash) return;
  if (skipHashChange === window.location.hash) {
    skipHashChange = null;
    return;
  }
  if (window.location.hash.length < 2) return;
  updateSnapshotData(window.location.hash.substring(1));
  dispatchEventRestore();
}
function onPopState(event) {
  const browserState = event.state;
  if (!browserState || !browserState.aelluxState) return;
  if (browserState.ajaxHref) {
    Aellux.ajaxHref?.load(
      window.location.href,
      browserState.ajaxHref,
      { ignoreHistory: true }
    );
  }
  if (browserState.snapshot) {
    updateSnapshotData(snapshotToString(browserState.snapshot));
    dispatchEventRestore();
  } else if (useHash) {
    updateSnapshotData(window.location.hash.substring(1));
    dispatchEventRestore();
  }
  if (!useHash) return;
  skipHashChange = window.location.hash;
  setTimeout(function() {
    if (skipHashChange === window.location.hash)
      skipHashChange = null;
  }, 0);
}
var globalSnapshot, globalRemoveSnapshot, globalSnapshotString, skipHashChange, baseTitle, useHash;
var init_aellux_uxm_state_navigation = __esm({
  "src/aellux.uxm.state-navigation.js"() {
    "use strict";
    globalSnapshot = {};
    globalRemoveSnapshot = {};
    globalSnapshotString = "";
    skipHashChange = null;
    baseTitle = "";
    useHash = true;
  }
});

// src/aellux.uxm.adaptive.js
var aellux_uxm_adaptive_exports = {};
__export(aellux_uxm_adaptive_exports, {
  destroy: () => destroy3,
  init: () => init3,
  mountDOM: () => mountDOM
});
async function init3() {
  mountDOM.set(`[${attr2.adaptive}]`, {
    update: updateAdaptive,
    unmount: unmountAdaptive
  });
}
async function destroy3() {
}
async function updateAdaptive(adaptiveContainer) {
  if (!adaptiveContainer.hasAttribute("aria-busy"))
    adaptiveContainer.setAttribute("aria-busy", true);
  Aellux.observe(adaptiveContainer, "resize");
  adaptiveContainer.addEventListener(Aellux.eventName("ResizeObserver"), onResizeObserver);
}
function unmountAdaptive(adaptiveContainer) {
  Aellux.unobserve(adaptiveContainer, "resize");
  adaptiveContainer.removeEventListener(Aellux.eventName("ResizeObserver"), onResizeObserver);
}
function onResizeObserver(event) {
  const entry = event.detail;
  const width = entry.contentRect.width;
  const height = entry.contentRect.height;
  const adaptiveContainer = entry.target;
  const params = Aellux.options.adaptiveParams;
  const ratioBreakpoints = params.ratioShapes;
  const ratio = height > 0 ? width / height : 0;
  adaptiveContainer.classList.toggle(modifier.shapeVertical, ratio < ratioBreakpoints.vertical);
  adaptiveContainer.classList.toggle(modifier.shapeHorizontal, ratio > ratioBreakpoints.horizontal);
  adaptiveContainer.classList.toggle(
    modifier.shapeSquare,
    ratio >= ratioBreakpoints.vertical && ratio <= ratioBreakpoints.horizontal
  );
  const sizes = Object.keys(params.minSizes);
  const spaceBreakpoints = params.minSizes;
  const space = Math.sqrt(width * height);
  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    adaptiveContainer.classList.toggle(
      Aellux.className("fits-" + size),
      space >= spaceBreakpoints[size]
    );
  }
  adaptiveContainer.setAttribute(Aellux.attr("ready"), "");
  Aellux.dispatchFrom(adaptiveContainer, "AdaptiveUpdate", { detail: null });
}
var attr2, modifier, mountDOM;
var init_aellux_uxm_adaptive = __esm({
  "src/aellux.uxm.adaptive.js"() {
    "use strict";
    attr2 = {
      adaptive: Aellux.attr("adaptive")
    };
    modifier = {
      shapeHorizontal: Aellux.className("shape-horizontal"),
      shapeVertical: Aellux.className("shape-vertical"),
      shapeSquare: Aellux.className("shape-square")
    };
    mountDOM = /* @__PURE__ */ new Map();
  }
});

// src/aellux.uxm.feedback.js
var aellux_uxm_feedback_exports = {};
__export(aellux_uxm_feedback_exports, {
  announce: () => announce,
  busy: () => busy,
  destroy: () => destroy4,
  error: () => error,
  init: () => init4,
  off: () => off,
  on: () => on,
  progress: () => progress,
  send: () => send,
  success: () => success,
  validate: () => validate,
  warning: () => warning
});
async function init4() {
}
async function destroy4() {
}
function on(type, handler) {
  if (!handlers.has(type)) {
    handlers.set(type, /* @__PURE__ */ new Set());
  }
  handlers.get(type).add(handler);
  return { off() {
    handlers.get(type)?.delete(handler);
  } };
}
function off(type, handler) {
  return handlers.get(type)?.delete(handler);
}
function warning(message) {
  send({ type: "warning", message });
}
function error(message) {
  send({ type: "error", message });
}
function success(message) {
  send({ type: "success", message });
}
function announce(message) {
  send({ type: "announce", message });
}
function busy(target, message, value) {
  send({ type: "busy", message, value, target });
}
function validate(target, message, value) {
  send({ type: "validate", message, value, target });
}
function progress(target, message, value) {
  send({ type: "progress", message, value, target });
}
function send({ type, message, value, target }) {
  target = target ?? document;
  const feedback = { type, message, value, target };
  Aellux.dispatchFrom(target, "Feedback", { detail: feedback });
  handlers.get(type)?.forEach((call) => call(feedback));
  handlers.get("*")?.forEach((call) => call(feedback));
}
var handlers;
var init_aellux_uxm_feedback = __esm({
  "src/aellux.uxm.feedback.js"() {
    "use strict";
    handlers = /* @__PURE__ */ new Map();
  }
});

// src/aellux.uxm.ajax-href.js
var aellux_uxm_ajax_href_exports = {};
__export(aellux_uxm_ajax_href_exports, {
  destroy: () => destroy5,
  init: () => init5,
  load: () => load
});
async function init5() {
  document.addEventListener("click", onClick);
}
async function destroy5() {
  document.removeEventListener("click", onClick);
}
async function load(url, selectors, options = {}) {
  options = options || {};
  if (previousController) {
    previousController.abort();
  }
  const controller = new AbortController();
  previousController = controller;
  const selectorList = (Array.isArray(selectors) ? selectors : selectors.split(",")).map((selector) => selector.trim()).filter(Boolean);
  const elements = /* @__PURE__ */ new Map();
  selectorList.forEach(function(selector) {
    const currentElement = document.querySelector(selector);
    if (!currentElement) return;
    elements.set(selector, currentElement);
    Aellux.feedback?.busy(currentElement, "Ajax loading", true);
    Aellux.feedback?.progress(currentElement, "Ajax loading", 0);
  });
  try {
    const response = await Aellux.request(url, { signal: controller.signal });
    const html = await response.text();
    const loadedDocument = new DOMParser().parseFromString(html, "text/html");
    selectorList.forEach(function(selector) {
      const currentElement = elements.get(selector);
      if (!currentElement) return;
      const loadedElement = loadedDocument.querySelector(selector);
      if (!loadedElement) return;
      const replacement = document.importNode(loadedElement, true);
      currentElement.replaceWith(replacement);
      if (selector === "title")
        Aellux.stateNavigation?.updateBaseTitle(replacement.innerText);
      Aellux(replacement);
      Aellux.feedback?.busy(replacement, "Ajax loaded", false);
      Aellux.feedback?.progress(replacement, "Ajax loaded", 1);
    });
    if (!options.ignoreHistory) {
      Aellux.stateNavigation?.ajaxHref(url, selectors);
    }
  } catch (error2) {
    selectorList.forEach(function(selector) {
      const currentElement = elements.get(selector);
      if (!currentElement) return;
      Aellux.feedback?.busy(currentElement, "Ajax loading", false);
      Aellux.feedback?.progress(currentElement, "Ajax loading", 1);
    });
    if (error2.name === "AbortError") return null;
    throw error2;
  } finally {
    previousController = null;
  }
}
function onClick(event) {
  if (event.button !== 0) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest(`[${attr3.ajaxHref}]`);
  if (!link || link.tagName !== "A") return;
  if (link.target && link.target !== "_self") return;
  if (link.hasAttribute("download")) return;
  const selectors = link.getAttribute(attr3.ajaxHref);
  if (!selectors) return;
  event.preventDefault();
  Aellux.ajaxHref.load(link.href, selectors);
}
var attr3, previousController;
var init_aellux_uxm_ajax_href = __esm({
  "src/aellux.uxm.ajax-href.js"() {
    "use strict";
    attr3 = {
      ajaxHref: Aellux.attr("ajax-href")
    };
    previousController = null;
  }
});

// src/aellux.orchestrator.esm.js
var root = typeof globalThis !== "undefined" ? globalThis : window;
var modulePromises = {};
root.Aellux = Object.assign(AelluxForceUpdate, root.Aellux, {
  async initModuleLoader() {
    const allModules = [];
    Aellux.options.load.forEach((mName) => allModules.push(
      loadUXM(mName).then((module) => {
        if ("init" in module && typeof module.init === "function" && "destroy" in module && typeof module.destroy === "function")
          return module.init();
      }).catch((error2) => {
        console.error(
          `[Aellux] UX module "${mName}" failed to initialize.`,
          error2
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
  update(root3) {
    AelluxForceUpdate(root3);
  },
  unmount(root3) {
    AelluxForceUnmount(root3);
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
    } catch (error2) {
      task.reject(error2);
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
      var error2 = new Error("HTTP " + response.status + " " + response.statusText);
      error2.name = "AelluxRequestError";
      error2.status = response.status;
      error2.statusText = response.statusText;
      error2.response = response;
      throw error2;
    }
    return response;
  }).catch(function(error2) {
    throw error2;
  });
}
function AelluxForceUpdate(root3) {
  return AelluxForce(root3, "update");
}
function AelluxForceUnmount(root3) {
  return AelluxForce(root3, "unmount");
}
function AelluxForce(root3, method) {
  resolveRoots(root3).forEach((rootElement) => {
    Aellux.options.load.forEach((mName) => {
      const key = toCamelCase(mName);
      const mounter = Aellux[key]?.mountDOM ?? null;
      if (!mounter) return;
      for (const [attr4, controller] of mounter) {
        if (!(method in controller)) continue;
        const elements = findElements(rootElement, attr4);
        elements.forEach((currentElement) => {
          try {
            Promise.resolve(controller[method](currentElement)).catch((error2) => console.error(error2));
          } catch (error2) {
            console.error(error2);
          }
        });
      }
    });
  });
}
function resolveRoots(root3) {
  if (!root3) {
    return [document];
  }
  if (typeof root3 === "string") {
    try {
      return Array.from(document.querySelectorAll(root3));
    } catch (error2) {
      return [];
    }
  }
  if (root3 instanceof Element || root3 instanceof Document || root3 instanceof DocumentFragment) {
    return [root3];
  }
  return [];
}
function findElements(root3, selector) {
  const elements = [];
  if (root3.nodeType === Node.ELEMENT_NODE && root3.matches(selector)) {
    elements.push(root3);
  }
  if (root3.querySelectorAll) {
    root3.querySelectorAll(selector).forEach(function(element) {
      elements.push(element);
    });
  }
  return elements;
}
function toCamelCase(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
var pageWasHidden = false;
window.addEventListener("pagehide", () => pageWasHidden = true);
window.addEventListener("pageshow", (event) => {
  if (event.persisted && pageWasHidden) {
    pageWasHidden = false;
  }
});

// src/aellux.full.esm.js
var root2 = typeof globalThis !== "undefined" ? globalThis : window;
root2.Aellux.bundledModules = Object.freeze({
  "preferences": () => Promise.resolve().then(() => (init_aellux_uxm_preferences(), aellux_uxm_preferences_exports)),
  "state-navigation": () => Promise.resolve().then(() => (init_aellux_uxm_state_navigation(), aellux_uxm_state_navigation_exports)),
  "adaptive": () => Promise.resolve().then(() => (init_aellux_uxm_adaptive(), aellux_uxm_adaptive_exports)),
  "feedback": () => Promise.resolve().then(() => (init_aellux_uxm_feedback(), aellux_uxm_feedback_exports)),
  "ajax-href": () => Promise.resolve().then(() => (init_aellux_uxm_ajax_href(), aellux_uxm_ajax_href_exports))
});
//# sourceMappingURL=aellux.full.esm.js.map
