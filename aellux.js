var Aellux = {
    legacy: false,
    supported: false,
    options: {},
    notAvailable: [],
    init: function (options) {
        if (typeof document === "undefined") {
            console.warn("[Aellux] Browser not supported.");
            return;
        }

        if (document.querySelector("[data-aellux-legacy]") ||
            document.querySelector("[data-aellux-module]")) return;

        Aellux.options = options || {};
        Aellux.notAvailable = [];
        addWeakStyles();
        loadAellux();
    }
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

function dispatchReady() {
    var event = document.createEvent("Event");
    event.initEvent("AelluxReady", false, false);
    document.dispatchEvent(event);
}

function loadAellux() {
    if (typeof Promise === "undefined") { Aellux.notAvailable.push("Promise"); }
    if (!("noModule" in document.createElement("script"))) { Aellux.notAvailable.push("ES modules"); }

    if (Aellux.notAvailable.length !== 0)
        return loadLegacyFallback();

    var script = document.createElement("script");
    script.type = "module";
    script.src = aelluxBasePath + "aellux.esm.js";
    script.setAttribute("data-aellux-module", "true");
    script.onload = function () {
        Aellux.legacy = false;
        Aellux.supported = true;
        Aellux.init();
        dispatchReady();
    };
    script.onerror = function () {
        script.parentNode.removeChild(script);
        console.warn("[Aellux] Modern runtime not supported. Fallback to legacy.");
        loadLegacyFallback();
    };
    document.head.appendChild(script);
}

function loadLegacyFallback() {
    if (typeof document === "undefined" ||
        document.querySelector("[data-aellux-legacy]"))
        return;

    if (Aellux.notAvailable.length !== 0)
        console.warn("[Aellux] " + Aellux.notAvailable.join(", ") + " not available in browser.");

    Aellux.legacy = true;
    Aellux.supported = false;

    var script = document.createElement("script");
    script.src = aelluxBasePath + "aellux.legacy.js";
    script.setAttribute("data-aellux-legacy", "true");
    script.onload = function () {
        dispatchReady();
    };
    script.onerror = function () {
        console.error("[Aellux] Legacy fallback could not be loaded.");
    };
    document.head.appendChild(script);
}

function addWeakStyles() {
    if (typeof document === "undefined" ||
        document.querySelector("[data-aellux-style]"))
        return;

    var style = document.createElement("style");
    style.setAttribute("data-aellux-style", "true");
    style.textContent =
        ":where(body,html) {" +
        "min-height:100vh;" +
        "min-height:100dvh;" +
        "font-family:system-ui;" +
        "color-scheme:light dark;" +
        "background-color:Canvas;" +
        "color:CanvasText;" +
        "}" +

        ":where(.ux-fill) {" +
        "width:100%;" +
        "height:100%;" +
        "min-width:0;" +
        "min-height:0;" +
        "}" +

        ":where([data-aellux-adaptive]) {" +
        "position:relative;" +
        "box-sizing:border-box;" +
        "display:inline-flex;" +
        "overflow:clip;" +
        "}";
    document.head.appendChild(style);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Aellux;
} else if (typeof globalThis !== "undefined") {
    globalThis.Aellux = Aellux;
} else if (typeof window !== "undefined") {
    window.Aellux = Aellux;
}