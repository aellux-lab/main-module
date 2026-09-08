// Aellux bootstrap: intentionally minimal and legacy-safe; keep feature logic out of 
// this file and use conservative JavaScript only.
// It must load either the ESM runtime or the legacy fallback without itself depending on 
// Promise, modules, async/await, or other modern-only features.
(() => {
    var root =
        typeof globalThis !== "undefined"
            ? globalThis
            : window;

    root.Aellux = {
        defaultAdaptiveCSSPromise: null,
        options: {
            themePreferenceAttribute: "data-aellux-theme",
            defaultAdaptiveCSS: false,
            preconnect: ["https://cdn.jsdelivr.net"],
            dependencies: {
                components: {
                    "interactjs": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
                    "motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm"
                }
            },
            load: [
                "preferences", // Preferencias de usuário togglers
                "state-navigation", // Continuidade de estado scroll, avançar/voltar back button popstate hash
                "adaptive-composition", // Composição adaptativa ao espaço/forma
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
            Aellux.aelluxBasePath = aelluxBasePath;
            Aellux.notAvailable = [];

            addDefaultAdaptiveCSS();
            addWeakStyles();
            loadAellux();

            var start = Date.now();
            document.addEventListener("AelluxAwake", function () {
                var time = Date.now() - start;
                console.log("[Aellux] Awake in " + (time / 1000) + "ms")
            });
            document.addEventListener("AelluxReady", function () {
                var time = Date.now() - start;
                console.log("[Aellux] Ready in " + (time / 1000) + "ms")
            });
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

    function addDefaultAdaptiveCSS() {
        var aelluxAdaptiveCSS = "aellux.uxm.adaptive.style.css";
        var attr = "data-aellux-adaptive-style";
        if (!Aellux.options.defaultAdaptiveCSS ||
            typeof document === "undefined" ||
            document.querySelector("[" + attr + "]"))
            return;

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = aelluxBasePath + aelluxAdaptiveCSS;
        link.setAttribute(attr, "true");
        document.head.appendChild(link);

        if (typeof Promise === "undefined") return;
        defaultAdaptiveCSSPromise = new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = resolve;
        });
    }

    function addWeakStyles() {
        var attr = "data-aellux-weak-style";
        if (typeof document === "undefined" ||
            document.querySelector("[" + attr + "]"))
            return;

        var style = document.createElement("style");
        style.setAttribute(attr, "true");
        style.textContent =
            ":where(button,a[href],[role='button'],[role='tab']){touch-action:manipulation;}" +
            ":where(html){color-scheme:light dark;}" + //auto device
            ":where(html[" + Aellux.options.themePreferenceAttribute + "='dark']){color-scheme:dark;}" + //pref force
            ":where(html[" + Aellux.options.themePreferenceAttribute + "='light']){color-scheme:light;}" + //pref force
            ":where(body,html) {" +
            "margin:0;" +
            "font-family:system-ui;" +
            "background-color:Canvas;" +
            "color:CanvasText;" +
            "}" +

            ":where([data-aellux-fill-viewport]) {height:100vh;height:100dvh;width:100vw;width:100dvw;position:fixed;inset:0;overflow:auto;}" +

            //ADAPTIVE INITIAL STATE
            ":where([data-aellux-adaptive]) {" +
            "position: relative;" +
            "box-sizing: border-box;" +
            "display: flex;" +
            "overflow: clip;" +
            "width: 100%;height: 100%;min-width: 0;min-height: 0;" +
            "}" +

            "[data-aellux-adaptive]:not([data-aellux-ready]) > *:not(progress[data-aellux-adaptive-progress]) {display: none!important;}" +
            "[data-aellux-adaptive][data-aellux-ready] > progress[data-aellux-adaptive-progress] {display: none!important;}";
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
})();