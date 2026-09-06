const defaults = {
  shortAttribute: false,
  themePreferenceAttribute: "ux-theme",
  importMap: {
    "@ux/bscroll": "https://cdn.jsdelivr.net/npm/better-scroll@2.5.1/+esm",
    "@ux/interact": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
    "@ux/motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm",
    "@ux/swiper": "https://cdn.jsdelivr.net/npm/swiper@14.2.0/+esm",
    "@ux/sortable": "https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/+esm",
    "@ux/floating": "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm"
  },
  getSelector: function (attr) {
    return `[data-aell${attr}]` + (this.shortAttribute ? `,[${attr}]` : ``);
  }
};
const options = {};

const uxLoad = [
  "ux-scrollbox",
  "ux-drawer",
  "ux-sheet",
  "ux-swipe",
  "ux-carousel",
  "ux-draggable",
  "ux-droppable",
  "ux-sortable",
  "ux-resizable",
  "ux-pinch",
  "ux-zoom",
  "ux-popover",
  "ux-tooltip",
  "ux-dropdown",
  "ux-contextmenu",
  "ux-autocomplete",
  "ux-picker",
  "ux-pullrefresh",
  "ux-infinitescroll",
  "ux-nestedscroll",
  "ux-floatingbar",
  "ux-haptic",
  "ux-toast",
  "ux-alert",
  "ux-snackbar",
  "ux-banner",
  "ux-animate",
  "ux-ajax-content"
];

const Aellux = {
  init: function (...args) {
    Object.assign(options, defaults, args[0]);

    addImportMap();
    addViewportMeta();
    addPreconnect("https://cdn.jsdelivr.net");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadModules, { once: true });
    } else loadModules();

    document.addEventListener("AelluxUpdateDOM", loadModules);
  },

  kill: function () {
    document.removeEventListener("AelluxUpdateDOM", loadModules);
  }
};

async function loadModules() {
  const allModules = [];
  await loadModuleUX("ux-adaptive");
  uxLoad.forEach(attr => allModules.push(loadModuleUX(attr)));
  await Promise.all(allModules);
}

async function loadModuleUX(attr) {
  const elements = document.querySelectorAll(options.getSelector(attr));
  if (elements.length == 0) return;

  const module = await import(`./aellux.${attr}.js`);
  module.init(elements, options);
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

function addImportMap() {
  if (document.querySelector("[data-aellux-importmap]"))
    return;
  const script = document.createElement("script");
  script.type = "importmap";
  script.textContent = JSON.stringify({ imports: options.importMap });
  document.head.append(script);
}

function addViewportMeta() {
  if (document.querySelector('meta[name="viewport"]'))
    return;
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1";
  document.head.appendChild(meta);
}

export default Aellux;