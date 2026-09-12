const controllers = new WeakMap();

export async function init() {
  //BFCache
  window.addEventListener("pagehide", () => pageWasHidden = true);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && pageWasHidden) {// página voltou via BFCache
      pageWasHidden = false;
      update();
    }
  });
  update();
}

export function update() {
  const tabGroups = document.querySelectorAll("[data-aellux-tab-group]");
  tabGroups.forEach(tabGroupContainer => {
    updateController(tabGroupContainer);
  }); //Safe to call again
}

export function snapshotRestore(detail) {
}

export async function kill() {

}

function updateController(container) {
  if (!controllers.has(container)) {
    const controller = _createController(container);
    controllers.set(container, controller);

    container.addEventListener("keydown", controller.onkeydown);
    container.addEventListener("click", controller.onclick);

    controller.changeTab(loadPersistTab(container), false);
    Aellux.wait("state-navigation").then(() => { snapshotNormalization(container); });
  }
}

function snapshotRestoreController(container, detail) {
  console.log("SNAP~RESTORE TABS");
  const controller = controllers.get(container);

  if (!controller) return;
  if (!detail || !detail.snapshot) return;

  let tab = null;
  const tabGroup = container.querySelector("nav");
  if (tabGroup.id in detail.snapshot) {
    const tabId = detail.snapshot[tabGroup.id];
    tab = tabGroup.querySelector(`#${tabId}`);
  }
  if (!tab) return;
  if (tab.getAttribute("aria-selected") === "false") // Prevent select what is already
    controller.changeTab(tab, true);
}

function killController(container) {
  const adaptiveController = controllers.get(container);
  container.addEventListener("keydown", adaptiveController.onkeydown);
  container.addEventListener("click", adaptiveController.onclick);
}

function _createController(container) {
  const tabGroup = container.querySelector("nav");
  tabGroup.id = tabGroup.id || "tabs";

  tabGroup.querySelectorAll("[data-aellux-tab]").forEach(tab => {
    const panelId = tab.getAttribute("data-aellux-tab");
    tab.id = tab.id || `${tabGroup.id}-tab-${panelId}`;
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-selected", false);
    tab.setAttribute("role", "tab");
    const panel = container.querySelector(`#${panelId}`);
    panel.setAttribute("data-aellux-tabpanel", panelId);
    //Se tiver LI de parent role=presentation
  });

  return {
    tabGroupId: tabGroup.id,
    currentSelectedTab: null,
    onkeydown(event) {

    },
    onclick(event) {
      const target = event.target;
      const tab = target.closest("[data-aellux-tab]");
      if (!tab) return;

      const controller = controllers.get(container);
      controller.changeTab(tab, true);
      Aellux.wait("state-navigation").then(() => {
        Aellux.stateNavigation.tabOpen(tabGroup.id, tab.id, tab.innerText);
      });
    },
    changeTab(currentTab, save) {
      const controller = controllers.get(container);
      if (controller.currentSelectedTab !== currentTab) {
        const tabGroup = container.querySelector("nav");
        tabGroup.querySelectorAll("[data-aellux-tab]").forEach((tab) => {
          if (currentTab === false) { currentTab = tab; }
          const selected = tab === currentTab || tab.id === currentTab;
          if (selected && currentTab !== tab) currentTab = tab;

          const panelId = tab.getAttribute("data-aellux-tab");
          tab.setAttribute("aria-selected", selected);
          tab.setAttribute("tabindex", selected ? 0 : -1);
          const panel = container.querySelector(`#${panelId}`);
          panel?.classList.toggle("ux-active", selected);
        });
      }
      if (save) savePersistTab(tabGroup, currentTab);
      controller.currentSelectedTab = currentTab;
    }
  };
}

function savePersistTab(tabGroup, tab) {
  if (tabGroup.hasAttribute("data-aellux-persist")) {
    const where = tabGroup.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      Aellux.persist[where].set("current-tab-" + tabGroup.id, tab.id);
    }
  }
}

function loadPersistTab(container) {
  const tabGroup = container.querySelector("nav");
  var current = false;

  if (tabGroup.hasAttribute("data-aellux-persist")) {
    const where = tabGroup.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      current = Aellux.persist[where].get("current-tab-" + tabGroup.id, false);
    }
  }
  return current;
}

function snapshotNormalization(container) {
  const adaptiveController = controllers.get(container);
  const tabGroupId = adaptiveController.tabGroupId;
  const tab = adaptiveController.currentSelectedTab;

  if (!tab ||
    (tabGroupId in Aellux.snapshot && Aellux.snapshot[tabGroupId] === tab.id))
    return; //SNAPSHOT ALIGNED

  //SNAPSHOT WRONG? UPDATE SILENTLY
  Aellux.stateNavigation.normalize(tabGroupId, tab.id, tab.innerText, true);
}