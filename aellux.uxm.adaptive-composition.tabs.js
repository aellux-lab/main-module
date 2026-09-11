const controllers = new WeakMap();

export function update(container) {
  if (!controllers.has(container)) {
    const controller = _createController(container);
    controllers.set(container, controller);

    container.addEventListener("keydown", controller.onkeydown);
    container.addEventListener("click", controller.onclick);

    if (!controller.currentSelectedTab) {
      controller.changeTab(loadPersistTab(container), false);
    }
  }

  controllers.get(container).updateCallback();
}

export function snapshotRestore(container, detail) {
  console.log("TABS RESTORE");
  const tabGroup = container.querySelector("nav");
  if (tabGroup.id in detail.snapshot) {
    const tabId = detail.snapshot[tabGroup.id];
    const tab = tabGroup.querySelector(`#${tabId}`);
    const controller = controllers.get(container);
    controller.changeTab(tab, true);
  }
}

export function kill(container) {
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
          if (!currentTab) { currentTab = tab; }
          const panelId = tab.getAttribute("data-aellux-tab");
          const selected = tab === currentTab;
          tab.setAttribute("aria-selected", selected);
          tab.setAttribute("tabindex", selected ? 0 : -1);
          const panel = container.querySelector(`#${panelId}`);
          panel?.classList.toggle("ux-active", selected);
        });
      }
      if (save) savePersistTab(tabGroup, currentTab);
      controller.currentSelectedTab = currentTab;
    },
    async updateCallback() {
      const tabGroup = container.querySelector("nav");
      const orientation = await Aellux.adaptiveComposition.inferOrientation(tabGroup);
      tabGroup.setAttribute("aria-orientation", orientation);
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
  var current = null;
  if (tabGroup.hasAttribute("data-aellux-persist")) {
    const where = tabGroup.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      current = Aellux.persist[where].get("current-tab-" + tabGroup.id, null);
    }
  }
  return current;
}