/*
    color scheme
    → light / dark / auto(device)

    contrast
    → default / more / less / (device)

    motion
    → default / reduced

    transparency
    → default / reduced

    text scale
    → default / large / custom

    interface scale
    → default / large / extra-large

    sound
    → on / reduced / off

    haptics
    → on / off

    @media (prefers-color-scheme: dark) { }
    @media (prefers-contrast: more) { }
    @media (prefers-reduced-motion: reduce) { }
    @media (forced-colors: active) { }
    @media (prefers-reduced-transparency: reduce) { }
 */

const userPreferences = {
  theme: "system",
  contrast: "system",
  motion: "system",
  transparency: "system",

  textScale: 1,
  interfaceScale: 1,

  largeTargets: false,
  extendedTiming: false,

  sound: true,
  haptics: true
};

export async function init() {
  //BFCache
  window.addEventListener("pagehide", () => pageWasHidden = true);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && pageWasHidden) {// página voltou via BFCache
      pageWasHidden = false;
      update();
    }
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== "AelluxPreferences") return;
    const preferences = new URLSearchParams(event.newValue || "");
    applyPreferences(preferences);
  });

  //localPreferences = loadPreferences();
}

export function update() {
  //Configure toggle buttons & events
}

export function kill() {

}

function savePreferences() {
  Aellux.persist.preferences.setObject(userPreferences);
}

function loadPreferences(preferences = null) {
  Object.assign(userPreferences, preferences ?? Aellux.persist.preferences.getObject());
}