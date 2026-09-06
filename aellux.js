let modulePromise;

addBaseWeakStyles(); // Pre-render best theme UX

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

function addBaseWeakStyles() {
    const url = "./aellux.weak-style.css";
    if (document.querySelector(`link[rel="stylesheet"][href="${url}"]`))
        return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Aellux;
} else if (typeof globalThis !== "undefined") {
    globalThis.Aellux = Aellux;
} else if (typeof window !== "undefined") {
    window.Aellux = Aellux;
}