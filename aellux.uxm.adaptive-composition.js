const selector = {};

export async function init() {
  return update();
}

export async function update() {
  const elements = document.querySelectorAll("[data-aellux-adaptive]:not([data-aellux-ready])");
  elements.forEach(element => {
    const adaptiveType = element.dataset.aelluxAdaptive;
    setup[adaptiveType](element);
  });
}

export async function kill() {

}

const setup = {
  "tabs": function (element) {
    // const tabsBar = element.querySelector(selector.tabsBar);
    // const contentArea = element.querySelector(selector.contentArea);


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
