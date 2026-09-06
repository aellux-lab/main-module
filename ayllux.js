let modulePromise;

const Ayllux = {
    async init(...args) {
        const loadedModule = await loadModule();
        // Incorpora a API real no mesmo objeto
        Object.assign(Ayllux, loadedModule); //!IMPORTANTE
        return loadedModule.init(...args);
    }
};

async function loadModule() {
    if (!modulePromise) {
        modulePromise = import("./ayllux.module.js")
            .then(module => {
                const realModule = module.default || module;
                return realModule;
            });
    }
    return modulePromise;
}

function addBaseStyles() {
    const style = document.createElement("style");
    style.dataset.aylluxBaseStyle = "";
    style.textContent = `
    :where(body) {
        min-height: 100vh;
        min-height: 100dvh;
        font-family: system-ui; 
        color-scheme: light dark;
        background-color: Canvas;
        color: CanvasText;
    }`;
    document.head.appendChild(style);
}

addBaseStyles();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Ayllux;
} else if (typeof globalThis !== "undefined") {
    globalThis.Ayllux = Ayllux;
} else if (typeof window !== "undefined") {
    window.AylluX = Ayllux;
}