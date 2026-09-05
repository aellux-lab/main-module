let modulePromise;

const Ayllux = {
    async init(...args) {
        const module = await loadModule();
        return module.init(...args);
    }
};

async function loadModule() {
    if (!modulePromise) {
        modulePromise = import("./ayllux.module.js")
            .then(module => {
                // Incorpora a API real no mesmo objeto
                Object.assign(Ayllux, module);
                return module;
            });
    }
    return modulePromise;
}

if (typeof globalThis !== "undefined") {
    globalThis.Ayllux = Ayllux;
} else if (typeof window !== "undefined") {
    window.AylluX = Ayllux;
} else if (typeof module !== "undefined" && module.exports) {
    module.exports = Ayllux;
}
