let modulePromise;

const Aellux = {
    async init(...args) {
        const loadedModule = await loadModule();
        // Incorpora a API real no mesmo objeto
        Object.assign(Aellux, loadedModule); //!IMPORTANTE
        return loadedModule.init(...args);
    }
};

async function loadModule() {
    if (!modulePromise) {
        modulePromise = import("./aellux.module.js")
            .then(module => {
                const realModule = module.default || module;
                return realModule;
            });
    }
    return modulePromise;
}

function addWeakStyles() {
    const style = document.createElement("style");
    style.dataset.aelluxWeakStyle = "";
    style.textContent = `
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
  min-width: 0;
  min-height: 0;
}

:where([ux-adaptive]) {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  overflow: clip;
}
    `;
    document.head.appendChild(style);
    document.style.display = "none";
}

addWeakStyles();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Aellux;
} else if (typeof globalThis !== "undefined") {
    globalThis.Aellux = Aellux;
} else if (typeof window !== "undefined") {
    window.Aellux = Aellux;
}