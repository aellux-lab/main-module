const controllers = new WeakMap();

export function updateController(adaptiveContainer) {
  if (!controllers.has(adaptiveContainer)) {
    const adaptiveController = _createController(adaptiveContainer);
    controllers.set(adaptiveContainer, adaptiveController);
  }
  controllers.get(adaptiveContainer).updateCallback();
}

function _createController(container) {
  let nav = container.querySelector("nav");
  nav.id = nav.id ?? "tabs";

  nav.querySelectorAll("[data-aellux-tab]").forEach(tab => {
    const panelId = tab.getAttribute("data-aellux-tab");
    const selected = false;
    tab.id = tab.id ?? `${navId}-${panelId}`;
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-selected", selected);
    tab.setAttribute("role", "tab");
    //Se tiver LI de parent role=presentation
  });

  const controller = {
    onkeydown(event) {

    },
    onclick(event) {
      const target = event.target;
      const tab = target.closest("[data-aellux-tab]");
      if (!tab) return;
      controllers.get(container).changeTab(tab, true);
    },
    changeTab(currentTab, save) {
      const nav = container.querySelector("nav");
      nav.querySelectorAll("[data-aellux-tab]").forEach((tab) => {
        if (!currentTab) { currentTab = tab; }
        const panelId = tab.getAttribute("data-aellux-tab");
        const selected = tab === currentTab || panelId === currentTab || tab.id === currentTab;
        tab.setAttribute("aria-selected", selected);
        tab.setAttribute("tabindex", selected ? 0 : -1);
        const panel = container.querySelector(`#${panelId}`);
        panel?.classList.toggle("ux-active", selected);
      });
      if (save) savePersist(nav, currentTab);
    },
    async updateCallback() {
      const nav = container.querySelector("nav");
      const orientation = await Aellux.adaptiveComposition.inferOrientation(nav);
      nav.setAttribute("aria-orientation", orientation);
    }
  };

  container.addEventListener("click", controller.onclick);
  nav.addEventListener("keydown", controller.onkeydown);
  loadPersist(nav);

  return controller;
}

function savePersist(nav, tab) {
  if (!nav.hasAttribute("data-aellux-persist")) return;
  const where = nav.getAttribute("data-aellux-persist") || "session";
  if (where === "local" || where === "session") {
    Aellux.persist[where].set("current-tab-" + nav.id, currentTab.id);
  }
}

function loadPersist(nav) {
  var current = null;
  if (nav.hasAttribute("data-aellux-persist")) {
    const where = nav.getAttribute("data-aellux-persist") || "session";
    if (where === "local" || where === "session") {
      current = Aellux.persist[where].get("current-tab-" + nav.id, null);
    }
  }
  changeTab(current);
}