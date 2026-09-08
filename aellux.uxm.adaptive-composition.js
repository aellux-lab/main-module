const selector = {};

export async function init() {
  return update();
}

export async function update() {
  const elements = document.querySelectorAll("[data-aellux-adaptive]");
  elements.forEach(element => {
    const adaptiveType = element.dataset.aelluxAdaptive;
    setup[adaptiveType](element);
  });
}

export async function kill() {

}

const setup = {
  "tabs": function (element) {
    const nav = element.querySelector("nav");

    const tabs = nav.querySelectorAll("[data-aellux-tab]");
    tabs.forEach(tab => {
      const selected = false;
      const panelId = tab.getAttribute("data-aellux-tab");
      const panel = element.querySelector(`#${panelId}`);
      tab.setAttribute("aria-selected", selected);
      panel.classList.toggle("ux-active", selected);

      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panelId);

      //Se tiver LI de parent role=presentation
    });
  },

  "flow": function (element) {
    //NEXT/PREV
  },

  "stack": function (element) {
    //TREE/BACK/BREADCRUMB
  },

  "list-content": function (element) {
    //Links / MAIN
  },
};
