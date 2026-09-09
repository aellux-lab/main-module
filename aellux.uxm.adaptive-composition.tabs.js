const controllers = new Map();

export function updateController(adaptiveContainer) {
  if (!controllers.has(adaptiveContainer)) {
    const adaptiveController = _createController(adaptiveContainer);
    controllers.set(adaptiveContainer, adaptiveController);
  }
  controllers.get(adaptiveContainer).updateCallback();
}

function _createController(container) {
  let nav = container.querySelector("nav");
  let navId = nav.getAttribute("id") ?? "tabs";

  nav.querySelectorAll("[data-aellux-tab]").forEach(tab => {
    const panelId = tab.getAttribute("data-aellux-tab");
    const tabId = tab.getAttribute("id") ?? `${navId}-${panelId}`;
    const selected = false;
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
      controllers.get(container).changeTab(tab);
    },
    changeTab(currentTab) {
      const nav = container.querySelector("nav");
      nav.querySelectorAll("[data-aellux-tab]").forEach((tab) => {
        const panelId = tab.getAttribute("data-aellux-tab");
        const selected = tab === currentTab || panelId === currentTab || tab.id === currentTab;
        tab.setAttribute("aria-selected", selected);
        tab.setAttribute("tabindex", selected ? 0 : -1);
        const panel = container.querySelector(`#${panelId}`);
        panel?.classList.toggle("ux-active", selected);
      });
    },
    async updateCallback() {
      const nav = container.querySelector("nav");
      const orientation = await Aellux.adaptiveComposition.inferOrientation(nav);
      nav.setAttribute("aria-orientation", orientation);
    }
  };
  container.addEventListener("click", controller.onclick);
  nav.addEventListener("keydown", controller.onkeydown);
  return controller;
}