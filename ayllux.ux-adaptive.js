export const styles = `
  :where([ux-adaptive]) {
    position:relative;
    box-sizing: border-box;
    display:inline-flex;
    overflow:clip;
  }
`;

export function init(elements, options = {}) {
  selector.tabsBar = options.getSelector("ux-tabs-bar");
  selector.contentArea = options.getSelector("ux-content-area");

  elements.forEach(element => {
    const adaptiveType = element.dataset.aylluxAdaptive ?? element.getAttribute("ux-adaptive");
    setup[adaptiveType](element, options);
  });
}

const selectors = {};

const setup = {
  "tabs": (element) => {
    const tabsBar = element.querySelector(selector.tabsBar);
    const contentArea = element.querySelector(selector.contentArea);


  }, // horizontal/vertical if scroll lock sidebars

  "flow": (element) => {

  },

  "stack": (element) => {

  },

  "list-content": (element) => {

  }, //Links, list or grid 
};
