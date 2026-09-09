const compositionScripts = new Map();

//TABS - FLOW - STACK - LISTCONTENT

export async function init() {
  const adaptiveScriptName = "aellux.uxm.adaptive-composition.";
  const entries = document.querySelectorAll("[data-aellux-adaptive]")
  for (var i = 0; i < entries.length; i++) {
    const el = entries[i];
    const adaptiveType = el.dataset.aelluxAdaptive;
    if (!compositionScripts.has(adaptiveType)) {
      compositionScripts.set(
        adaptiveType,
        await import(Aellux.aelluxBasePath + adaptiveScriptName + adaptiveType + ".js")
      );
    }
  }
}

export function update(entries) {
  for (var i = 0; i < entries.length; i++) {
    const adaptiveContainer = entries[i].target;
    const adaptiveType = adaptiveContainer.dataset.aelluxAdaptive;
    Aellux.wait(`adaptive-composition.${adaptiveType}`).then(m =>
      m.updateController(adaptiveContainer)
    );
  }
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