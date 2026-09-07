const defaultOptions = {
  shortAttribute: null,
  themePreferenceAttribute: "data-ux-theme",
  importMap: {
    "@ux/interact": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
    "@ux/motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm",
    "@ux/swiper": "https://cdn.jsdelivr.net/npm/swiper@14.2.0/+esm",
  }
};

const uxmLoad = [
  "preferences", // Preferencias de usabilidade
  "events", // Ambiente de dispatch de eventos de input/feedback usados pelos outros módulos
  "nav-adaptive", // Navegação adaptativa
  "nav-state", // Continuidade de estado scroll, avançar/voltar back button popstate hash
  "dialog", // Usabilidade de dialogo/modal
  "ajax", // Conteúdo assíncrono
  //"components"
];

const Aellux = {
  options: {},
  init: function (...args) {
    Object.assign(this.options, defaultOptions, args[0]);

    addImportMap();
    addViewportMeta();
    addPreconnect("https://cdn.jsdelivr.net");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupAllModules, { once: true });
    } else setupAllModules();

    document.addEventListener("AelluxUpdateDOM", setupAllModules);
  },

  kill: function () {
    document.removeEventListener("AelluxUpdateDOM", setupAllModules);
  },

  on: function (event, ...args) {
    document.addEventListener(`Aellux${event}`, ...args);
  },

  off: function (event, handler) {
    document.removeEventListener(`Aellux${event}`, ...args);
  },

  wait: function (moduleName) {
    return new Promise((resolve, reject) => {
      resolve(this[moduleName]);
    });
  },

  getSelector: function (attr) {
    return `[${this.getAttributeName(attr)}]`;
  },

  getAttributeName: function (attr) {
    return this.options.shortAttribute ? `${(this.shortAttribute + attr)}` : `data-aellux-${attr}`;
  },

};

async function setupAllModules() {
  const allModules = [];

  //Load Async
  uxmLoad.forEach(mName => allModules.push(loadUXM(mName)));

  await Promise.all(allModules);

  //Initialize In Order
  uxmLoad.forEach(mName => Aellux[mName].init());

  if (document.body.style.display === "none") {
    document.body.style.display = null; //Show body
  }
}

function toCamelCase(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

async function loadUXM(mName) {
  const module = await import(`./aellux.uxm.${mName}.js`);
  const realModule = module.defaults || module;
  const key = toCamelCase(mName);
  Aellux[key] = realModule;
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

if (typeof globalThis !== "undefined") {
  Object.assign(globalThis.Aellux, Aellux);
} else if (typeof window !== "undefined") {
  Object.assign(window.Aellux, Aellux);
}