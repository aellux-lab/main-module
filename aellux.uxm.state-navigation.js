const globalSnapshot = {};
const globalRemoveSnapshot = {};

let globalSnapshotString = "";
let skipHashChange = null;
let baseTitle = "";

let useHash = true;

export function init() {
  console.log("STATE NAVIGATION INIT");
  window.addEventListener("popstate", onPopState);
  window.addEventListener("hashchange", onHashChange);

  Aellux.snapshot = {};

  //Restore snapshot listener
  Aellux.on("SnapshotRestore", function (event) {
    Aellux.options.load.forEach(mName => {
      Aellux.wait(mName).then(uxm => {
        if (typeof uxm.snapshotRestore === "function")
          uxm.snapshotRestore(event.detail);
      });
    });
  });

  useHash = Aellux.options.useHash ?? useHash;
  baseTitle = document.title;
  onHashChange();
  history.replaceState({
    aelluxState: true,
    snapshot: { ...globalSnapshot }
  }, "");
}

export async function kill() {
  window.removeEventListener("popstate", onPopState);
  window.removeEventListener("hashchange", onHashChange);
}

export function tabOpen(tabGroupId, tabId, title) {
  return change(tabGroupId, tabId, title);
}

export function urlState(url, options) {

}

export function flowStep(flowId, step, options) {

}

export function formUpdate(formId, event, value, options) {

}

export function normalize(key, value, title = null, silent) {
  return change(key, value, title, silent);
}

function change(key, value, title, silent = false) {
  if (globalSnapshot.title === title &&
    globalSnapshot[key] === value) return;

  globalSnapshot.title = title;
  globalSnapshot[key] = value;
  updateSnapshotData(snapshotToString(globalSnapshot));

  const state = { aelluxState: true, snapshot: { ...globalSnapshot } };
  const url = useHash ? `#${globalSnapshotString}` : undefined;

  if (silent) history.replaceState(state, "", url);
  else history.pushState(state, "", url);

  dispatchSnapshotEvent("SnapshotChange");
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
  Object.assign(Aellux.snapshot, globalSnapshot);
  Aellux.dispatch(name, options);
}

function dispatchEventRestore() {
  return dispatchSnapshotEvent("SnapshotRestore");
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