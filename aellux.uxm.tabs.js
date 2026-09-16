"use strict";

export { init, kill, update, snapshotRestore };

const controllers = new WeakMap();
let pageWasHidden = false;

const attr = {
  tabGroup: Aellux.attr("tab-group"),
  tabPanel: Aellux.attr("tab-panel"),
  tab: Aellux.attr("tab"),
  title: Aellux.attr("title"),
  ready: Aellux.attr("ready"),
}

const className = {
  active: Aellux.className("active")
}

async function init() {
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

function update() {
  const tabGroups = document.querySelectorAll(`[${attr.tabGroup}]`);
  tabGroups.forEach(tabGroupContainer => {
    updateController(tabGroupContainer);
  }); //Safe to call again
}

function snapshotRestore(detail) {
  const tabGroups = document.querySelectorAll(`[${attr.tabGroup}]`);
  tabGroups.forEach(tabGroupContainer => {
    snapshotRestoreController(tabGroupContainer, detail);
  }); //Safe to call again
}

async function kill() {

}

function updateController(tabGroup) {
  if (!controllers.has(tabGroup)) {
    const controller = _createController(tabGroup);
    controllers.set(tabGroup, controller);

    tabGroup.addEventListener("keydown", controller.onkeydown);
    tabGroup.addEventListener("click", controller.onclick);

    controller.changeTab(loadPersistTab(tabGroup), false);
    Aellux.wait("state-navigation").then(() => { snapshotNormalization(tabGroup); });
    Aellux.dispatchFrom(tabGroup, "TabsReady", { detail: null });
  }
}

function snapshotRestoreController(tabGroup, detail) {
  const controller = controllers.get(tabGroup);

  if (!controller) return;
  if (!detail || !detail.snapshot) return;

  let tab = null;
  if (tabGroup.id in detail.snapshot) {
    const tabId = detail.snapshot[tabGroup.id];
    tab = tabGroup.querySelector(`#${tabId}`);
  }
  if (!tab) return;
  if (tab.getAttribute("aria-selected") === "false") // Prevent select what is already
    controller.changeTab(tab, true);
}

function killController(tabGroup) {
  const adaptiveController = controllers.get(tabGroup);
  tabGroup.addEventListener("keydown", adaptiveController.onkeydown);
  tabGroup.addEventListener("click", adaptiveController.onclick);
}

function _createController(tabGroup) {
  tabGroup.id = tabGroup.id || "tabs";

  tabGroup.querySelectorAll(`[${attr.tab}]`).forEach(tab => {
    const panelId = tab.getAttribute(attr.tab);
    tab.id = tab.id || `${tabGroup.id}-tab-${panelId}`;
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-selected", false);
    tab.setAttribute("role", "tab");
    const panel = document.querySelector(`#${panelId}`);
    panel.setAttribute(attr.tabPanel, panelId);
    //Se tiver LI de parent role=presentation
  });

  return {
    tabGroupId: tabGroup.id,
    currentSelectedTab: null,
    onkeydown(event) {

    },
    onclick(event) {
      const target = event.target;
      const tab = target.closest(`[${attr.tab}]`);
      if (!tab) return;

      const controller = controllers.get(tabGroup);
      const showTitle = tab.hasAttribute(attr.title);
      const title = tab.getAttribute(attr.title) || tab.innerText;
      controller.changeTab(tab, true);
      Aellux.stateNavigation?.tabOpen(
        tabGroup.id,
        tab.id,
        showTitle ? title : undefined
      );
    },
    changeTab(currentTab, save) {
      const controller = controllers.get(tabGroup);
      if (controller.currentSelectedTab !== currentTab) {
        tabGroup.querySelectorAll(`[${attr.tab}]`).forEach((tab) => {
          if (currentTab === false) { currentTab = tab; }
          const selected = tab === currentTab || tab.id === currentTab;
          if (selected && currentTab !== tab) currentTab = tab;

          const panelId = tab.getAttribute(attr.tab);
          tab.setAttribute("aria-selected", selected);
          tab.setAttribute("tabindex", selected ? 0 : -1);
          const panel = document.querySelector(`#${panelId}`);
          panel?.classList.toggle(className.active, selected);
        });
        Aellux.dispatchFrom(currentTab, "TabsChangeTab", { detail: controller });
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

function loadPersistTab(tabGroup) {
  var current = false;

  if (tabGroup.hasAttribute("data-aellux-persist")) {
    const where = tabGroup.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      current = Aellux.persist[where].get("current-tab-" + tabGroup.id, false);
    }
  }
  return current;
}

function snapshotNormalization(tabGroup) {
  const adaptiveController = controllers.get(tabGroup);
  const tabGroupId = adaptiveController.tabGroupId;
  const tab = adaptiveController.currentSelectedTab;
  const snapshot = Aellux.stateNavigation.globalSnapshot;

  if (!tab || !snapshot ||
    (tabGroupId in snapshot && snapshot[tabGroupId] === tab.id))
    return; //SNAPSHOT ALIGNED

  //SNAPSHOT WRONG? UPDATE SILENTLY
  Aellux.stateNavigation?.normalize(tabGroupId, tab.id, tab.innerText, true);
}