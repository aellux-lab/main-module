//ajax-content ajax-href ajax-progress
export { init, kill, update, snapshotRestore };
export { load };

const attr = {
  ajaxHref: Aellux.attr("ajax-href")
};

async function init() {
  document.addEventListener("click", onClick);
}
async function kill() { }
async function update() { }
function snapshotRestore() { }

let previousController = null;

async function load(url, selectors, options = {}) {
  options = options || {};
  if (previousController) { previousController.abort(); }
  const controller = new AbortController();
  previousController = controller;

  const selectorList = (
    Array.isArray(selectors) ?
      selectors :
      selectors.split(",")
  ).map(selector => selector.trim())
    .filter(Boolean);

  const elements = new Map();

  selectorList.forEach(function (selector) {
    const currentElement = document.querySelector(selector);
    if (!currentElement) return;
    elements.set(selector, currentElement);
    //feedback busy/progress
    Aellux.feedback?.busy(currentElement, "Ajax loading", true);
    Aellux.feedback?.progress(currentElement, "Ajax loading", 0);
  });

  try {
    const response = await Aellux.request(url, { signal: controller.signal });
    const html = await response.text();

    selectorList.forEach(function (selector) {
      const currentElement = elements.get(selector);
      if (!currentElement) return;

      const loadedDocument = new DOMParser().parseFromString(html, "text/html");
      const loadedElement = loadedDocument.querySelector(selector);
      if (!loadedElement) return;

      const replacement = document.importNode(loadedElement, true);
      currentElement.replaceWith(replacement);
      Aellux(replacement);

      Aellux.stateNavigation?.ajaxHref(url);

      //feedback busy/progress
      Aellux.feedback?.busy(replacement, "Ajax loaded", false);
      Aellux.feedback?.progress(replacement, "Ajax loaded", 1);
    });
  }
  catch (error) {
    selectorList.forEach(function (selector) {
      const currentElement = elements.get(selector);
      if (!currentElement) return;
      //feedback busy/progress
      Aellux.feedback?.busy(currentElement, "Ajax loading", false);
      Aellux.feedback?.progress(currentElement, "Ajax loading", 1);
    });

    if (error.name === "AbortError") return null;
    throw error;
  }
  finally {
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