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

if (typeof module !== "undefined" && module.exports) {
    module.exports = Ayllux;
} else if (typeof globalThis !== "undefined") {
    globalThis.Ayllux = Ayllux;
} else if (typeof window !== "undefined") {
    window.AylluX = Ayllux;
}