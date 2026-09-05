let modulePromise;

const AylluX = {
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
                Object.assign(AylluX, module);
                return module;
            });
    }
    return modulePromise;
}


// Disponibiliza globalmente em qualquer ambiente que tenha globalThis
if (typeof globalThis !== "undefined") {
    globalThis.AylluX = AylluX;
}

// CommonJS
if (typeof module !== "undefined" && module.exports) {
    module.exports = AylluX;
}
