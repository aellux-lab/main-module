// Aellux bootstrap: intentionally minimal and legacy-safe; keep feature logic out of 
// this file and use conservative JavaScript only.
// It must load either the ESM runtime or the legacy fallback without itself depending on 
// Promise, modules, async/await, or other modern-only features.

(function () {
  var CONSTANTS = deepFreeze({
    AELLUX_EVENT_NAME_PREFFIX: "Aellux",
    AELLUX_UXM_SCRIPT_PREFFIX: "uxm",
    AELLUX_DATA_ATTRIBUTE_NAME_PREFFIX: "aellux",
    AELLUX_MINIFIED_SCRIPT_SUFFIX: "min",

    AELLUX_DEFAULT_INITIALIZATION_OPTIONS: {
      defaultAdaptiveCSS: false,
      dependencies: {
        components: {
          "interactjs": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
          "motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm"
        },
        scrollbox: {
          "@better-scrol": "https://cdn.jsdelivr.net/npm/better-scroll@2.5.1/+esm",
          "@better-scroll/slide": "https://cdn.jsdelivr.net/npm/@better-scroll/slide@2.5.1/dist/slide.min.js",
          "@better-scroll/scroll-bar": "https://cdn.jsdelivr.net/npm/@better-scroll/scroll-bar@2.5.1/dist/scroll-bar.min.js",
          "@better-scroll/mouse-wheel": "https://cdn.jsdelivr.net/npm/@better-scroll/mouse-wheel@2.5.1/+esm"
        }
      },
      load: [
        "preferences", // Preferencias de usuário togglers
        "state-navigation", // Continuidade de estado scroll, avançar/voltar back button popstate hash
        "adaptive", // Composição adaptativa ao espaço/forma,
        "tabs",
        "feedback",
        "scrollbox",
        "ajax-href", // Navegação HREF com conteúdo assíncrono substituído
      ],
      preferencesOptions: {
        colorScheme: ["auto", "light", "dark"],
        contrast: ["auto", "no-preference", "more", "less"],
        reducedMotion: ["auto", "no-preference", "reduced"],
        reducedTransparency: ["auto", "no-preference", "reduced"],
        forcedColors: ["auto", "no-preference", "active"],
        textScale: [1, 1.5, 0.8],
        interfaceScale: [1, 1.5, 0.8],
        extendedTiming: ["off", "on"],
        largeTargets: ["off", "on"],
        haptics: ["on", "off"],
        sound: ["off", "on", "low"],
      },
      preferencesMediaQueries: {
        colorScheme: {
          "light": window.matchMedia("(prefers-color-scheme: light)"),
          "dark": window.matchMedia("(prefers-color-scheme: dark)")
        },
        reducedMotion: {
          "reduced": window.matchMedia("(prefers-reduced-motion: reduced)"),
          "no-preference": window.matchMedia("(prefers-reduced-motion: no-preference)")
        },
        reducedTransparency: {
          "reduced": window.matchMedia("(prefers-reduced-transparency: reduced)"),
          "no-preference": window.matchMedia("(prefers-reduced-transparency: no-preference)")
        },
        forcedColors: {
          "active": window.matchMedia("(forced-colors: active)"),
          "no-preference": window.matchMedia("(forced-colors: no-preference)")
        },
        contrast: {
          "more": window.matchMedia("(prefers-contrast: more)"),
          "less": window.matchMedia("(prefers-contrast: less)"),
          "no-preference": window.matchMedia("(prefers-contrast: no-preference)")
        },
      },
      adaptiveParams: {
        experienceScale: {
          near: 1,
          far: 1.5
        },
        minSizes: {
          compact: 0,
          small: 480,
          medium: 768,
          large: 1024,
          wide: 1280,
          ultrawide: 1600
        },
        ratioShapes: {
          vertical: 0.8,
          //>square<
          horizontal: 1.25
        }
      }
    }
  });

  var aelluxBootstrapSrc =
    typeof document !== "undefined" &&
      document.currentScript &&
      document.currentScript.src
      ? document.currentScript.src
      : "";

  var aelluxBasePath = aelluxBootstrapSrc
    ? aelluxBootstrapSrc.substring(0,
      aelluxBootstrapSrc.lastIndexOf("/") + 1)
    : "";

  var root =
    typeof globalThis !== "undefined"
      ? globalThis
      : window;

  var old$AInstance = root.$A;

  root.Aellux = {
    options: CONSTANTS.AELLUX_DEFAULT_INITIALIZATION_OPTIONS,
    init(options) {
      if (typeof document === "undefined") {
        console.log("[Aellux] Browser not supported.");
        return;
      }

      if (document.querySelector(Aellux.attr("legacy")) ||
        document.querySelector(Aellux.attr("esm"))) return;

      mergeOptions(Aellux.options, options || {});
      Aellux.aelluxBasePath = aelluxBasePath;
      Aellux.notAvailable = [];

      addDefaultAdaptiveCSS();
      addWeakStyles();
      loadAellux();
    },
    kill() { return false; },
    update(element) { return false; },
    legacy: false,
    supported: false,
    notAvailable: [],
    persist: Object.freeze({
      local: buildPersistMemory("localStorage"),
      session: buildPersistMemory("sessionStorage"),
      preferences: buildPersistMemory("localStorage", "AelluxPreferences")
    }),
    request: defaultRequest,
    defaultAdaptiveCSSPromise: null,
    updatePreferencesAttributesHTML: updatePreferencesAttributesHTML,
    on(event, handler, options) { document.addEventListener(Aellux.eventName(event), handler, options); },
    off(event, handler, options) { document.removeEventListener(Aellux.eventName(event), handler, options); },
    attr(name) { return "data-" + CONSTANTS.AELLUX_DATA_ATTRIBUTE_NAME_PREFFIX + "-" + name; },
    uxmFilename(name) { return "aellux." + CONSTANTS.AELLUX_UXM_SCRIPT_PREFFIX + "." + name + ".js"; },
    eventName(name) { return CONSTANTS.AELLUX_EVENT_NAME_PREFFIX + name; },
    noConflict() { return old$AInstance; }
  };

  root.$A = root.Aellux;

  function dispatchAwake() {
    var event = document.createEvent("Event");
    event.initEvent(Aellux.eventName("Awake"), false, false);
    document.dispatchEvent(event);
  }

  function loadAellux() {
    var attr = Aellux.attr("esm");
    if (typeof Promise === "undefined") { Aellux.notAvailable.push("Promise"); }
    if (!("noModule" in document.createElement("script"))) { Aellux.notAvailable.push("ES modules"); }

    if (Aellux.notAvailable.length !== 0)
      return loadLegacyFallback();

    Aellux.options.load.forEach(function (uxmName) { //PRELOAD ALL
      if (true || Aellux.options.load.indexOf(uxmName) !== -1) {
        var link = document.createElement("link");
        link.rel = "modulepreload";
        link.href = aelluxBasePath + Aellux.uxmFilename(uxmName);
        document.head.appendChild(link);
      }
    });

    var script = document.createElement("script");
    script.type = "module";
    script.src = aelluxBasePath + "aellux.loader.esm.js";
    script.setAttribute(attr, "true");
    script.onload = function () {
      Aellux.legacy = false;
      Aellux.supported = true;
      Aellux.initModuleLoader();
      dispatchAwake();
    };
    script.onerror = function () {
      script.parentNode.removeChild(script);
      console.log("[Aellux] Modern runtime not supported. Fallback to legacy.");
      loadLegacyFallback();
    };
    document.head.appendChild(script);
  }

  function loadLegacyFallback() {
    var attr = Aellux.attr("legacy");
    if (typeof document === "undefined" ||
      document.querySelector("[" + attr + "]"))
      return;

    if (Aellux.notAvailable.length !== 0)
      console.log("[Aellux] " + Aellux.notAvailable.join(", ") + " not available in browser.");

    Aellux.legacy = true;
    Aellux.supported = false;

    var script = document.createElement("script");
    script.src = aelluxBasePath + "aellux.legacy.js";
    script.setAttribute(attr, "true");
    script.onload = function () {
      dispatchAwake();
    };
    script.onerror = function () {
      console.error("[Aellux] Legacy fallback could not be loaded.");
    };
    document.head.appendChild(script);
  }

  function addDefaultAdaptiveCSS() {
    var aelluxAdaptiveCSS = "aellux.uxm.adaptive.style.css";
    var attr = Aellux.attr("adaptive-style");
    if (!Aellux.options.defaultAdaptiveCSS ||
      typeof document === "undefined" ||
      document.querySelector("[" + attr + "]"))
      return;

    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = aelluxBasePath + aelluxAdaptiveCSS;
    document.head.appendChild(link);

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = aelluxBasePath + aelluxAdaptiveCSS;
    link.setAttribute(attr, "true");
    document.addEventListener("DOMContentLoaded", function (e) {
      document.head.appendChild(link);
    });

    if (typeof Promise === "undefined") return;
    Aellux.defaultAdaptiveCSSPromise = new Promise(function (resolve, reject) {
      link.onload = resolve;
      link.onerror = resolve;
    });
  }

  function addWeakStyles() {
    var attr = Aellux.attr("weak-style");
    if (typeof document === "undefined" ||
      document.querySelector("[" + attr + "]"))
      return;

    //SET HTML TO PERSISTED PREFERENCES
    updatePreferencesAttributesHTML();

    var p = Aellux.attr("");
    var style = document.createElement("style");
    style.setAttribute(attr, "true");
    style.textContent =
      ":where(button,a[href],[role='button'],[role='tab']){touch-action:manipulation;}" +
      ":where(html){color-scheme:light dark;}" +
      ":where(html[" + p + "color-scheme='dark']){color-scheme:dark;}" + //pref force
      ":where(html[" + p + "color-scheme='light']){color-scheme:light;}" + //pref force
      ":where(body,html) {margin:0;font-family:system-ui;background-color:Canvas;color:CanvasText;}" +

      ":where([" + p + "fill-viewport]) {position:fixed;height:100vh;height:100dvh;width:100vw;width:100dvw;inset:0;overflow:auto;}" +
      ":where([" + p + "fill-parent]) { position: relative;box-sizing: border-box;width: 100%;height: 100%;min-width: 0;min-height: 0;overflow:auto; }" +

      "[" + p + "adaptive]:not([" + p + "ready]) > *:not(progress) {display: none!important;}" +
      "[" + p + "adaptive][" + p + "ready] > progress[" + p + "adaptive-progress] {display: none!important;}";
    document.head.appendChild(style);

    if (!document.querySelector('meta[name="viewport"]')) {
      var meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      document.head.appendChild(meta);
    }
  }

  function updatePreferencesAttributesHTML(preferences = null) {
    var allQueries = Aellux.options.preferencesMediaQueries;
    preferences = preferences ?? Aellux.persist.preferences.getObject();
    Object.entries(allQueries).forEach(([param, queries]) => {
      Object.entries(queries).forEach(([value, query]) => {
        if (!preferences || !preferences[param] || preferences[param] === "auto") {
          if (!query.matches) return;
        } else if (preferences[param] !== value) return;
        var hyphenized = fromCamelCase(param);
        document.documentElement.setAttribute(Aellux.attr(hyphenized), value);
      })
    });
  }

  function buildPersistMemory(name, identifier) {
    var defaultIdentifier = identifier ?? "AelluxPersist";

    try {
      var target = window[name] || null;
      if (!target ||
        typeof target.setItem !== "function" ||
        typeof target.getItem !== "function") {
        throw new Error("Storage unavailable");
      }
    } catch (error) {
      var target = {
        setItem(key, value) { this[key] = value; },
        getItem(key) { return this[key] ?? null; }
      };
    }

    function getData() { return new URLSearchParams(target.getItem(defaultIdentifier) || ""); }
    return {
      get(key, fallback) {
        return getData().get(key) || fallback;
      },
      set(key, value) {
        var data = getData();
        data.set(key, value);
        return target.setItem(defaultIdentifier, data.toString());
      },
      setObject(object) {
        var data = getData();
        Object.entries(object).forEach(([key, value]) => data.set(key, value));
        return target.setItem(defaultIdentifier, data.toString());
      },
      getObject() {
        var data = getData();
        var object = {};
        data.forEach((value, key) => object[key] = value);
        return object;
      }
    };
  }

  function mergeOptions(target, source) {
    if (!source)
      return target;

    for (var key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key))
        continue;
      if (
        key === "__proto__" ||
        key === "constructor" ||
        key === "prototype"
      )
        continue;
      var sourceValue = source[key];
      var targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue)
      ) {

        if (
          !targetValue ||
          typeof targetValue !== "object" ||
          Array.isArray(targetValue)
        ) {
          targetValue = {};
          target[key] = targetValue;
        }
        mergeOptions(targetValue, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }
    return target;
  }

  function toCamelCase(name) { return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); };
  function fromCamelCase(name) { return name.replace(/([A-Z])/g, "-$1").toLowerCase(); };

  function deepFreeze(object) {
    Object.freeze(object);
    Object.values(object).forEach(function (value) {
      if (
        value &&
        typeof value === "object" &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value);
      }
    });
    return object;
  }

  function inferDistantEnvironment() {
    var noHover =
      matchMedia("(hover: none)").matches;

    var noFinePointer =
      !matchMedia("(any-pointer: fine)").matches;

    var largeViewport =
      window.innerWidth >= 960 &&
      window.innerHeight >= 540;

    return noHover && noFinePointer && largeViewport;
  }

  function defaultRequest(url, options) {
    var requestOptions = Object.assign(
      { method: "GET", credentials: "same-origin" },
      options
    );
    return fetch(url, requestOptions)
      .then(function (response) {
        if (!response.ok) {
          var error = new Error("HTTP " + response.status + " " + response.statusText);
          error.name = "AelluxRequestError";
          error.status = response.status;
          error.statusText = response.statusText;
          error.response = response;
          throw error;
        }
        return response;
      }).catch(function (error) {
        throw error;
      });
  };
})();