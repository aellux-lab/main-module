const compositionScripts = new Map();
let pageWasHidden = false;

export async function init() {
  Aellux.wait("defaultAdaptiveCSSPromise")
    .then(() => {
      if (document.readyState === "loading") {
        document.addEventListener(
          "DOMContentLoaded",
          adaptiveObserverUpdate,
          { once: true }
        );
      } else {
        adaptiveObserverUpdate();
      }
    });
}

export function update() {
  adaptiveObserverUpdate();
}

export function snapshotRestore(detail) {
}

export async function kill() {
  Aellux.resizeObserver.disconnect();
}

function adaptiveObserverUpdate() {
  const adaptives = document.querySelectorAll("[data-aellux-adaptive]");
  adaptives.forEach(adaptiveContainer => {
    if (!adaptiveContainer.hasAttribute("aria-busy"))
      adaptiveContainer.setAttribute("aria-busy", true);
    Aellux.resizeObserver.observe(adaptiveContainer)
    adaptiveContainer.addEventListener("AelluxResizeObserver", onResizeObserver);
  }); //Safe to call again
}

function onResizeObserver(event) {
  const entry = event.detail;
  const element = entry.target;
  const width = entry.contentRect.width;
  const height = entry.contentRect.height;

  const params = Aellux.options.adaptiveParams;
  //RATIO SHAPE
  const ratioBreakpoints = params.ratioShapes;
  const ratio = height > 0 ? width / height : 0;

  element.classList.toggle("ux-shape-vertical", ratio < ratioBreakpoints.vertical);
  element.classList.toggle("ux-shape-horizontal", ratio > ratioBreakpoints.horizontal);
  element.classList.toggle("ux-shape-square",
    ratio >= ratioBreakpoints.vertical &&
    ratio <= ratioBreakpoints.horizontal
  );

  //SPACE SIZE
  const sizes = Object.keys(params.minSizes);
  const spaceBreakpoints = params.minSizes;
  const space = Math.sqrt(width * height);

  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    element.classList.toggle(
      "ux-fits-" + size,
      space >= spaceBreakpoints[size]
    );
  }

  //const orientation = inferOrientation(element);

  element.setAttribute("data-aellux-ready", "");
}

function inferOrientation(flexBox, selector = "*") {
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