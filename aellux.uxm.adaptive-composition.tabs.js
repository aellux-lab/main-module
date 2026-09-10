const controllers = new WeakMap();

export function updateController(adaptiveContainer) {
  if (!controllers.has(adaptiveContainer)) {
    const adaptiveController = _createController(adaptiveContainer);
    controllers.set(adaptiveContainer, adaptiveController);

    adaptiveContainer.addEventListener("keydown", adaptiveController.onkeydown);
    adaptiveContainer.addEventListener("click", adaptiveController.onclick);
    adaptiveController.changeTab(loadPersistTab(adaptiveContainer), false);
  }
  controllers.get(adaptiveContainer).updateCallback();
}

function _createController(container) {
  const nav = container.querySelector("nav");
  nav.id = nav.id || "tabs";

  nav.querySelectorAll("[data-aellux-tab]").forEach(tab => {
    const panelId = tab.getAttribute("data-aellux-tab");
    tab.id = tab.id || `${nav.id}-tab-${panelId}`;
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

      Aellux.wait("state-navigation").then(() => {
        Aellux.stateNavigation.push(
          () => this.changeTab(tab, true),
          () => this.changeTab(this.currentSelectedTab, true),
        )
      }).catch(() => { });
    },
    changeTab(currentTab, save) {
      const nav = container.querySelector("nav");
      nav.querySelectorAll("[data-aellux-tab]").forEach((tab) => {
        if (!currentTab) { currentTab = tab; }
        const panelId = tab.getAttribute("data-aellux-tab");
        const selected = tab === currentTab;
        tab.setAttribute("aria-selected", selected);
        tab.setAttribute("tabindex", selected ? 0 : -1);
        const panel = container.querySelector(`#${panelId}`);
        panel?.classList.toggle("ux-active", selected);
      });
      if (save) savePersistTab(nav, currentTab);
      this.currentSelectedTab = currentTab;
    },
    async updateCallback() {
      const nav = container.querySelector("nav");
      const orientation = await Aellux.adaptiveComposition.inferOrientation(nav);
      nav.setAttribute("aria-orientation", orientation);
    }
  };
}

function savePersistTab(nav, tab) {
  if (nav.hasAttribute("data-aellux-persist")) {
    const where = nav.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      Aellux.persist[where].set("current-tab-" + nav.id, tab.id);
    }
  }
}

function loadPersistTab(container) {
  const nav = container.querySelector("nav");
  var current = null;
  if (nav.hasAttribute("data-aellux-persist")) {
    const where = nav.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      current = Aellux.persist[where].get("current-tab-" + nav.id, null);
    }
  }
  return current;
}