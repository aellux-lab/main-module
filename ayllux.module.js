const importMap = document.createElement("script");
importMap.type = "importmap";
importMap.textContent = JSON.stringify({
    imports: {
        "@ayx/bscroll": "https://cdn.jsdelivr.net/npm/better-scroll@2.5.1/+esm",
        "@ayx/interact": "https://cdn.jsdelivr.net/npm/interactjs@1.10.28/+esm",
        "@ayx/motion": "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm",
        "@ayx/swiper": "https://cdn.jsdelivr.net/npm/swiper@14.2.0/+esm",
        "@ayx/sortable": "https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/+esm",
        "@ayx/floating": "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm"
    }
});
document.head.append(importMap);

export function init(...args) {
  const load = [
    "x-scroll",
    "x-drawer",
    "x-sheet",
    "x-swipe",
    "x-carousel",
    "x-draggable",
    "x-droppable",
    "x-sortable",
    "x-resizable",
    "x-pinch",
    "x-zoom",
    "x-popover",
    "x-tooltip",
    "x-dropdown",
    "x-contextmenu",
    "x-autocomplete",
    "x-picker",
    "x-pullrefresh",
    "x-infinitescroll",
    "x-nestedscroll",
    "x-floatingbar",
    "x-haptic",
    "x-toast",
    "x-alert",
    "x-snackbar",
    "x-banner",
    "x-animate",
    "x-ajax-content"
  ];
  load.forEach(ux => loadUX(ux));
}

function loadUX(ux){
  const obj = document.querySelectorAll("[x-scroll]")
  if (obj.length == 0) return;
  
  import("./ayllux.x-scroll.js").then(module => module.init(obj));
}
