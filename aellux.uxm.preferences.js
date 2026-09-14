const userPreferences = Object.create(null);

export async function init() {
  window.addEventListener("storage", function (event) {
    if (event.key !== "AelluxPreferences") return;
    const newPreferences = new URLSearchParams(event.newValue || "");
    newPreferences.forEach((value, key) => userPreferences[key] = value);
    saveUserPreferences();
    update();
  });

  //Default values
  Object.entries(Aellux.options.preferencesOptions)
    .forEach(([param, options]) => userPreferences[param] = options[0]);

  loadUserPreferences();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update, { once: true });
  } else {
    update();
  }
}

export function update() {
  //Configure toggle buttons & events
  preferenceContainersUpdate();
}

export function kill() {

}

export function get(preference) {
  const key = Aellux.toCamelCase(preference);
  return userPreferences[key];
}

export function set(preference, value) {
  const key = Aellux.toCamelCase(preference);
  if (userPreferences[key] === value) return;
  userPreferences[key] = value;
  saveUserPreferences();
}

function saveUserPreferences() {
  Aellux.persist.preferences.setObject(userPreferences);
}

function loadUserPreferences(preferences = null) {
  const loaded = Aellux.persist.preferences.getObject();
  Object.assign(userPreferences, loaded);
}

function preferenceContainersUpdate() {
  const preferencesOptions = Aellux.options.preferencesOptions;
  document.querySelectorAll(`[data-aellux-preference]`)
    .forEach(container => {
      const ready = container.getAttribute("data-aellux-ready");
      if (!ready) { setupPreferenceContainer(container); }

      const preference = container.getAttribute("data-aellux-preference");
      const elements = container.querySelectorAll("[data-aellux-toggle]");
      const key = Aellux.toCamelCase(preference);
      elements.forEach(element => {
        const value = element.getAttribute("data-aellux-toggle");
        element.classList.toggle("ux-active", value === userPreferences[key]);
      });
    });
}

function setupPreferenceContainer(container) {
  container.addEventListener("click", onContainerClick);
  container.setAttribute("[data-aellux-ready]");
}

function onContainerClick(event) {
  const container = event.currentTarget;
  const toggler = event.target?.closest("[data-aellux-toggle]") ?? null;
  const buttonNext = event.target?.closest("[data-aellux-next]") ?? null;
  const buttonPrev = event.target?.closest("[data-aellux-prev]") ?? null;
  if (toggler) {
    const preference = container.getAttribute("data-aellux-preference");
    const value = toggler.getAttribute("data-aellux-toggle");
    set(preference, value);
  } else if (buttonNext || buttonPrev) {
    const preference = container.getAttribute("data-aellux-preference");
    const change = buttonNext ? 1 : -1;
    //TODO LIST OPTIONS
  }
}

/*
    @media (prefers-color-scheme: dark) { }
    @media (prefers-contrast: more) { }
    @media (prefers-reduced-motion: reduce) { }
    @media (forced-colors: active) { }
    @media (prefers-reduced-transparency: reduce) { }
 */