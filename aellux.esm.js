const root = typeof globalThis !== "undefined" ? globalThis : window;
const previousBootstrapURL = root.__aelluxBootstrapURL;

root.__aelluxBootstrapURL = new URL("./aellux.js", import.meta.url).href;

try {
  await import("./aellux.js");
} finally {
  if (previousBootstrapURL === undefined) {
    delete root.__aelluxBootstrapURL;
  } else {
    root.__aelluxBootstrapURL = previousBootstrapURL;
  }
}

const Aellux = root.Aellux;

export { Aellux };
export default Aellux;
