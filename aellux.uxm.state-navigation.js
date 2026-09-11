const globalSnapshot = {};
const globalRemoveSnapshot = {};

let globalSnapshotString = "";
let skipHashChange = null;
let baseTitle = "";

let useHash = true;

export async function init() {
  useHash = Aellux.options.useHash ?? useHash;

  baseTitle = document.title;

  onHashChange();
  history.replaceState({
    aelluxState: true,
    snapshot: { ...globalSnapshot },
    removeSnapshot: { ...globalRemoveSnapshot }
  }, "");

  window.addEventListener("popstate", onPopState);
  window.addEventListener("hashchange", onHashChange);

  //Restore snapshot listener
  Aellux.on("SnapshotRestore", function (event) {
    Aellux.options.load.forEach(mName => {
      Aellux.wait(mName).then(uxm => {
        if (typeof uxm.snapshotRestore === "function")
          uxm.snapshotRestore(event.detail);
      });
    });
  });
}

export async function kill() {
  window.removeEventListener("popstate", onPopState);
  window.removeEventListener("hashchange", onHashChange);
}

export function tabOpen(tabGroupId, tabId, title) {
  return pushState(tabGroupId, tabId, title);
}

export function urlState(url, options) {

}

export function flowStep(flowId, step, options) {

}

export function formUpdate(formId, event, value, options) {

}

export function pushState(key, value, title = null) {
  globalSnapshot.title = title;
  globalSnapshot[key] = value;
  updateSnapshotData(snapshotToString(globalSnapshot));

  history.pushState({
    aelluxState: true,
    snapshot: { ...globalSnapshot }
  },
    "",
    useHash ? `#${globalSnapshotString}` : undefined);

  dispatchSnapshotEvent("AelluxSnapshotChange");
}

function updateSnapshotData(string) {
  globalSnapshotString = string;

  for (const key in globalRemoveSnapshot) { delete globalRemoveSnapshot[key]; } //CLEAR
  Object.assign(globalRemoveSnapshot, globalSnapshot); //OLD

  for (const key in globalSnapshot) { delete globalSnapshot[key]; } //CLEAR
  (new URLSearchParams(string)).forEach((value, key) => globalSnapshot[key] = value); //NEW

  for (const key in globalRemoveSnapshot) { //FILTER REMOVED 
    if (key in globalSnapshot) { delete globalRemoveSnapshot[key]; }
  }
}

function snapshotToString(snapshot) {
  return (new URLSearchParams(snapshot || {})).toString();
}

function dispatchSnapshotEvent(name) {
  document.title = globalSnapshot.title ?
    `${globalSnapshot.title} - ${baseTitle}` :
    baseTitle;

  const options = {
    detail: {
      snapshot: globalSnapshot,
      removeSnapshot: globalRemoveSnapshot
    },
    bubbles: true
  };
  Aellux.dispatch(name, options);
}

function dispatchEventRestore() {
  return dispatchSnapshotEvent("AelluxSnapshotRestore");
}

function onHashChange() {
  if (!useHash) return;
  if (skipHashChange === window.location.hash) { skipHashChange = null; return; }
  if (window.location.hash.length < 2) return;
  updateSnapshotData(window.location.hash.substring(1));
  dispatchEventRestore();
}

function onPopState(event) {
  const browserState = event.state;
  if (!browserState || !browserState.aelluxState) return;

  if (browserState.snapshot) {
    updateSnapshotData(snapshotToString(browserState.snapshot));
    dispatchEventRestore();
  } else if (useHash) {
    updateSnapshotData(window.location.hash.substring(1));
    dispatchEventRestore();
  }

  if (!useHash) return;
  skipHashChange = window.location.hash;
  setTimeout(function () {
    if (skipHashChange === window.location.hash)
      skipHashChange = null;
  }, 0);
}