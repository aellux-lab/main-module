const stateHistory = [];
let currentIndex = -1;

export async function init() {
  history.replaceState({ aelluxState: true, index: -1 }, "");
  window.addEventListener("popstate", onPopState);
}

export async function kill() {
  window.removeEventListener("popstate", onPopState);
}

export function push(execute, undo, run) {
  if ((execute && typeof execute !== "function") ||
    (undo && typeof undo !== "function")) return;

  if (run) execute();
  // Remove toda a cadeia de forward.
  stateHistory.splice(currentIndex + 1);

  stateHistory.push({ execute, undo });
  currentIndex = stateHistory.length - 1;

  history.pushState({
    aelluxState: true,
    index: currentIndex
  }, "");
}

function onPopState(event) {
  const browserState = event.state;
  if (!browserState || !browserState.aelluxState) return;

  const targetIndex = browserState.index;

  if (targetIndex < currentIndex) {
    for (let i = currentIndex; i > targetIndex; i--)
      stateHistory[i].undo();
  } else if (targetIndex > currentIndex) {
    for (let i = currentIndex + 1; i <= targetIndex; i++)
      stateHistory[i].execute();
  }

  currentIndex = targetIndex;
}