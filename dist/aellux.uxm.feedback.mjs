/*! Aellux | SPDX-License-Identifier: Apache-2.0 | See LICENSE for terms. */
const handlers = /* @__PURE__ */ new Map();
async function init() {
}
async function destroy() {
}
function on(type, handler) {
  if (!handlers.has(type)) {
    handlers.set(type, /* @__PURE__ */ new Set());
  }
  handlers.get(type).add(handler);
  return { off() {
    handlers.get(type)?.delete(handler);
  } };
}
function off(type, handler) {
  return handlers.get(type)?.delete(handler);
}
function warning(message) {
  send({ type: "warning", message });
}
function error(message) {
  send({ type: "error", message });
}
function success(message) {
  send({ type: "success", message });
}
function announce(message) {
  send({ type: "announce", message });
}
function busy(target, message, value) {
  send({ type: "busy", message, value, target });
}
function validate(target, message, value) {
  send({ type: "validate", message, value, target });
}
function progress(target, message, value) {
  send({ type: "progress", message, value, target });
}
function send({ type, message, value, target }) {
  target = target ?? document;
  const feedback = { type, message, value, target };
  Aellux.dispatchFrom(target, "Feedback", { detail: feedback });
  handlers.get(type)?.forEach((call) => call(feedback));
  handlers.get("*")?.forEach((call) => call(feedback));
}
export {
  announce,
  busy,
  destroy,
  error,
  init,
  off,
  on,
  progress,
  send,
  success,
  validate,
  warning
};
//# sourceMappingURL=aellux.uxm.feedback.mjs.map
