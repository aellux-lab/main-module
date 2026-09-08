// Aellux bootstrap: intentionally minimal and legacy-safe; keep feature logic out of 
// this file and use conservative JavaScript only.
// It must load either the ESM runtime or the legacy fallback without itself depending on 
// Promise, modules, async/await, or other modern-only features.

var Aellux = {
    options: {
        themePreferenceAttribute: "data-aellux-theme",
        adaptiveStyles: true,
        preconnect: ["https://cdn.jsdelivr.net"],
        importMap: {
            "interact": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
            "motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm"
        },
        load: [
            "preferences", // Preferencias de usuário toggle
            "state-navigation", // Continuidade de estado scroll, avançar/voltar back button popstate hash
            "adaptive-composition", // Navegação adaptativa
            "ajax-content", // Conteúdo assíncrono substituído
            "components" // Comportamentos de componentes de interação pré-fabricados
        ],
        adaptiveParams: {
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
    },
    init: function (options) {
        if (typeof document === "undefined") {
            console.log("[Aellux] Browser not supported.");
            return;
        }

        if (document.querySelector("[data-aellux-legacy]") ||
            document.querySelector("[data-aellux-esm]")) return;

        mergeOptions(Aellux.options, options || {});
        Aellux.notAvailable = [];

        addWeakStyles();
        addAdaptiveStyles();
        loadAellux();
    },
    legacy: false,
    supported: false,
    notAvailable: []
};

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

function dispatchAwake() {
    var event = document.createEvent("Event");
    event.initEvent("AelluxAwake", false, false);
    document.dispatchEvent(event);
}

function loadAellux() {
    var attr = "data-aellux-esm";
    if (typeof Promise === "undefined") { Aellux.notAvailable.push("Promise"); }
    if (!("noModule" in document.createElement("script"))) { Aellux.notAvailable.push("ES modules"); }

    if (Aellux.notAvailable.length !== 0)
        return loadLegacyFallback();

    var script = document.createElement("script");
    script.type = "module";
    script.src = aelluxBasePath + "aellux.esm.js";
    script.setAttribute(attr, "true");
    script.onload = function () {
        Aellux.legacy = false;
        Aellux.supported = true;
        Aellux.initModule();
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
    var attr = "data-aellux-legacy";
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

function addAdaptiveStyles() {
    var attr = "data-aellux-adaptive-style";
    if (!Aellux.options.adaptiveStyles ||
        typeof document === "undefined" ||
        document.querySelector("[" + attr + "]"))
        return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = aelluxBasePath + "aellux.uxm.nav-adaptive.style.css";
    link.setAttribute(attr, "true");
    document.head.appendChild(link);
}

function addWeakStyles() {
    var attr = "data-aellux-weak-style";
    if (typeof document === "undefined" ||
        document.querySelector("[" + attr + "]"))
        return;

    var style = document.createElement("style");
    style.setAttribute(attr, "true");
    style.textContent =
        ":where(body,html) {" +
        "min-height:100vh;" +
        "min-height:100dvh;" +
        "font-family:system-ui;" +
        "color-scheme:light dark;" +
        "background-color:Canvas;" +
        "color:CanvasText;" +
        "}";
    document.head.appendChild(style);

    if (!document.querySelector('meta[name="viewport"]')) {
        var meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content = "width=device-width, initial-scale=1";
        document.head.appendChild(meta);
    }
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

if (typeof module !== "undefined" && module.exports) {
    module.exports = Aellux;
} else if (typeof globalThis !== "undefined") {
    globalThis.Aellux = Aellux;
} else if (typeof window !== "undefined") {
    window.Aellux = Aellux;
}