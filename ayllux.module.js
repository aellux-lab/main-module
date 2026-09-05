const defaults = {
  shortAttribute: false,
  importMap: {
    "@ux/bscroll": "https://cdn.jsdelivr.net/npm/better-scroll@2.5.1/+esm",
    "@ux/interact": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
    "@ux/motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm",
    "@ux/swiper": "https://cdn.jsdelivr.net/npm/swiper@14.2.0/+esm",
    "@ux/sortable": "https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/+esm",
    "@ux/floating": "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm"
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

export function init(...args) {
  Object.assign(options, defaults, args[0]);

  addImportMap();
  addPreconnect("https://cdn.jsdelivr.net");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadModules, { once: true });
  } else loadModules();

  document.addEventListener("AylluxUpdateDOM", loadModules);
}

export function kill() {
  document.removeEventListener("AylluxUpdateDOM", loadModules);
}

async function loadModules() {
  await loadModuleUX("ux-layout");
  uxLoad.forEach(attr => loadModuleUX(attr));
}

function loadModuleUX(attr) {
  const selector = `[data-ayll${attr}]`
    + (options.shortAttribute ? `,[${attr}]` : ``);

  const elements = document.querySelectorAll(selector);
  if (elements.length == 0) return;

  return new Promise((resolve, reject) => {
    import(`./ayllux.${attr}.js`)
      .then(module => {
        module.init(elements, options)
        resolve();
      });
  });
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