const defaults = {
  shortAttribute: false,
  styles: `
    :where(body) {
      min-height: 100vh;
      min-height: 100dvh;
      font-family: system-ui; 
      color-scheme: light dark;
      background-color: Canvas;
      color: CanvasText;
    }

    :where([ux-fill]) {
      width: 100%;
      height: 100%;
      min-width:0;
      min-height:0;
    }`,
  importMap: {
    "@ux/bscroll": "https://cdn.jsdelivr.net/npm/better-scroll@2.5.1/+esm",
    "@ux/interact": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
    "@ux/motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm",
    "@ux/swiper": "https://cdn.jsdelivr.net/npm/swiper@14.2.0/+esm",
    "@ux/sortable": "https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/+esm",
    "@ux/floating": "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm"
  },
  getSelector: function (attr) {
    return `[data-ayll${attr}]` + (this.shortAttribute ? `,[${attr}]` : ``);
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

const Ayllux = {
  init: function (...args) {
    Object.assign(options, defaults, args[0]);

    addImportMap();
    addViewportMeta();
    addPreconnect("https://cdn.jsdelivr.net");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadModules, { once: true });
    } else loadModules();

    document.addEventListener("AylluxUpdateDOM", loadModules);
  },

  kill: function () {
    document.removeEventListener("AylluxUpdateDOM", loadModules);
  }
};

export default Ayllux;

async function loadModules() {
  const allModules = [];
  await loadModuleUX("ux-adaptive");
  uxLoad.forEach(attr => allModules.push(loadModuleUX(attr)));
  await Promise.all(allModules);
  addBaseStyles();
}

async function loadModuleUX(attr) {
  const elements = document.querySelectorAll(options.getSelector(attr));
  if (elements.length == 0) return;

  const module = await import(`./ayllux.${attr}.js`);
  if (module.styles) options.styles += module.styles;
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
  if (document.querySelector("[data-ayllux-importmap]"))
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

function addBaseStyles() {
  const exists = document.querySelector("[data-ayllux-base-style]");
  if (!exists) {
    const style = document.createElement("style");
    style.dataset.aylluxBaseStyle = "";
    style.textContent = options.styles;
    document.head.appendChild(style);
    return;
  }
  //Update
  if (exists.textContent !== options.styles) {
    exists.textContent = options.styles;
  }
}