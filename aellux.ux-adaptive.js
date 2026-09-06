const selector = {};

export function init(elements, options = {}) {
  selector.tabsBar = options.getSelector("ux-tabs-bar");
  selector.contentArea = options.getSelector("ux-content-area");

  elements.forEach(element => {
    const adaptiveType = element.dataset.aelluxAdaptive ?? element.getAttribute("ux-adaptive");
    setup[adaptiveType](element, options);
  });
}

const selectors = {};

const setup = {
  "tabs": function (element) {
    const tabsBar = element.querySelector(selector.tabsBar);
    const contentArea = element.querySelector(selector.contentArea);


  }, // horizontal/vertical if scroll lock sidebars

  "flow": function (element) {

  },

  "stack": function (element) {

  },

  "list-content": function (element) {

  }, //Links, list or grid 
};
