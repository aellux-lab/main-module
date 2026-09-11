const compositionScripts = new Map();
let pageWasHidden = false;

//TABS - FLOW - STACK - LISTCONTENT

export async function init() {
  const adaptiveScriptName = "aellux.uxm.adaptive-composition.";
  const entries = document.querySelectorAll("[data-aellux-adaptive]")
  for (var i = 0; i < entries.length; i++) {
    const container = entries[i];
    const adaptiveType = container.dataset.aelluxAdaptive;
    if (!compositionScripts.has(adaptiveType)) {
      compositionScripts.set(
        adaptiveType,
        await import(Aellux.aelluxBasePath + adaptiveScriptName + adaptiveType + ".js")
      );
    }
    const script = compositionScripts.get(adaptiveType);
    if (typeof script.init === "function")
      await script.init(container);
  }

  //BFCache
  window.addEventListener("pagehide", () => pageWasHidden = true);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && pageWasHidden) {// página voltou via BFCache
      pageWasHidden = false;
      update();
    }
  });
}

export function update(entries = null) {
  callAdaptiveModules("update", entries);
}

export function snapshotRestore(detail) {
  callAdaptiveModules("snapshotRestore", null, detail);
}

export async function kill() {

}

export function inferOrientation(flexBox, selector) {
  return Aellux.layout.read(() => {
    const fallback = "horizontal";
    var style = getComputedStyle(flexBox);

    if (style.display === "flex" || style.display === "inline-flex") {
      return style.flexDirection.indexOf("column") === 0
        ? "vertical"
        : "horizontal";
    }

    if (!selector || selector.length === 0) return fallback;
    var children = flexBox.querySelectorAll(selector);
    if (children.length < 2) return fallback;

    var first = children[0].getBoundingClientRect();
    var second = children[1].getBoundingClientRect();

    var deltaX = Math.abs(
      (second.left + second.width / 2) -
      (first.left + first.width / 2)
    );
    var deltaY = Math.abs(
      (second.top + second.height / 2) -
      (first.top + first.height / 2)
    );

    return deltaY > deltaX
      ? "vertical"
      : "horizontal";
  });
}

function callAdaptiveModules(method, entries = null, ...args) {
  if (!entries) entries = document.querySelectorAll("[data-aellux-adaptive]");
  entries.forEach(entry => {
    const adaptiveContainer = entry.target ?? entry;
    const adaptiveType = adaptiveContainer.dataset.aelluxAdaptive;
    Aellux.wait(`adaptive-composition.${adaptiveType}`).then(
      adaptiveModule => {
        if (typeof adaptiveModule[method] === "function")
          adaptiveModule[method](adaptiveContainer, ...args)
      }
    );
  })
}