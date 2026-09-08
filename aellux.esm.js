const root =
  typeof globalThis !== "undefined"
    ? globalThis
    : window;
const Aellux = root.Aellux || {};
const modulePromises = {};

Object.assign(Aellux, {
  initModule: function () {
    addAdaptiveStyles().then(() => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", Aellux.adaptiveObserveNew, { once: true });
      } else {
        Aellux.adaptiveObserveNew();
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
  adaptiveObserveNew: function () {
    const adaptives = document.querySelectorAll("[data-aellux-adaptive]:not([data-aellux-ready])");
    adaptives.forEach(adaptive => Aellux.adaptiveObserver.observe(adaptive));
  },

  resolve: function (uxm, alias) {
    return Aellux.options.dependencies[uxm][alias];
  }
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
        const realModule =
          module.default || module;
        const key = toCamelCase(mName);
        Aellux[key] = realModule;
        return realModule;
      });

  return modulePromises[mName];
}

function addPreconnect(url) {
  if (document.querySelector(`link[rel="preconnect"][href="${url}"]`))
    return;

  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

function AdaptiveResizeObserver(entries) {
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    //ARE PARENTS DISPLAYED
    applyAdaptiveClasses(
      entry.target,
      entry.contentRect.width,
      entry.contentRect.height
    );
    entry.target.setAttribute("data-aellux-ready", "");
  }
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
}

function addAdaptiveStyles() {
  return new Promise((resolve, reject) => {
    var aelluxAdaptiveStyle = "aellux.uxm.adaptive.style.css";
    var attr = "data-aellux-adaptive-style";
    if (!Aellux.options.adaptiveStyles ||
      typeof document === "undefined" ||
      document.querySelector("[" + attr + "]"))
      return resolve();

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = Aellux.aelluxBasePath + aelluxAdaptiveStyle;
    link.setAttribute(attr, "true");
    document.head.appendChild(link);

    link.onload(resolve);
  });
}