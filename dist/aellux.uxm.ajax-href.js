const attr = {
  ajaxHref: Aellux.attr("ajax-href")
};
async function init() {
  document.addEventListener("click", onClick);
}
async function destroy() {
  document.removeEventListener("click", onClick);
}
let previousController = null;
async function load(url, selectors, options = {}) {
  options = options || {};
  if (previousController) {
    previousController.abort();
  }
  const controller = new AbortController();
  previousController = controller;
  const selectorList = (Array.isArray(selectors) ? selectors : selectors.split(",")).map((selector) => selector.trim()).filter(Boolean);
  const elements = /* @__PURE__ */ new Map();
  selectorList.forEach(function(selector) {
    const currentElement = document.querySelector(selector);
    if (!currentElement) return;
    elements.set(selector, currentElement);
    Aellux.feedback?.busy(currentElement, "Ajax loading", true);
    Aellux.feedback?.progress(currentElement, "Ajax loading", 0);
  });
  try {
    const response = await Aellux.request(url, { signal: controller.signal });
    const html = await response.text();
    const loadedDocument = new DOMParser().parseFromString(html, "text/html");
    selectorList.forEach(function(selector) {
      const currentElement = elements.get(selector);
      if (!currentElement) return;
      const loadedElement = loadedDocument.querySelector(selector);
      if (!loadedElement) return;
      const replacement = document.importNode(loadedElement, true);
      currentElement.replaceWith(replacement);
      if (selector === "title")
        Aellux.stateNavigation?.updateBaseTitle(replacement.innerText);
      Aellux(replacement);
      Aellux.feedback?.busy(replacement, "Ajax loaded", false);
      Aellux.feedback?.progress(replacement, "Ajax loaded", 1);
    });
    if (!options.ignoreHistory) {
      Aellux.stateNavigation?.ajaxHref(url, selectors);
    }
  } catch (error) {
    selectorList.forEach(function(selector) {
      const currentElement = elements.get(selector);
      if (!currentElement) return;
      Aellux.feedback?.busy(currentElement, "Ajax loading", false);
      Aellux.feedback?.progress(currentElement, "Ajax loading", 1);
    });
    if (error.name === "AbortError") return null;
    throw error;
  } finally {
    previousController = null;
  }
}
function onClick(event) {
  if (event.button !== 0) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest(`[${attr.ajaxHref}]`);
  if (!link || link.tagName !== "A") return;
  if (link.target && link.target !== "_self") return;
  if (link.hasAttribute("download")) return;
  const selectors = link.getAttribute(attr.ajaxHref);
  if (!selectors) return;
  event.preventDefault();
  Aellux.ajaxHref.load(link.href, selectors);
}
export {
  destroy,
  init,
  load
};
//# sourceMappingURL=aellux.uxm.ajax-href.js.map
