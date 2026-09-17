/*! Aellux | SPDX-License-Identifier: Apache-2.0 | See LICENSE for terms. */
const root = typeof globalThis !== "undefined" ? globalThis : window;
const previousBootstrapURL = root.__aelluxBootstrapURL;
const bootstrapFilename = /\.min\.js(?:[?#]|$)/.test(import.meta.url) ? "./aellux.min.js" : "./aellux.js";
const bootstrapURL = new URL(bootstrapFilename, import.meta.url).href;
root.__aelluxBootstrapURL = bootstrapURL;
try {
  await import(bootstrapURL);
} finally {
  if (previousBootstrapURL === void 0) {
    delete root.__aelluxBootstrapURL;
  } else {
    root.__aelluxBootstrapURL = previousBootstrapURL;
  }
}
const Aellux = root.Aellux;
var aellux_esm_default = Aellux;
export {
  Aellux,
  aellux_esm_default as default
};
//# sourceMappingURL=aellux.esm.js.map
