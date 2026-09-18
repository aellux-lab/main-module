/*! Aellux | SPDX-License-Identifier: Apache-2.0 | See LICENSE for terms. */

import "./aellux.orchestrator.mjs";

const root = typeof globalThis !== "undefined" ? globalThis : window;

root.Aellux.bundledModules = Object.freeze({
  "preferences": () => import("./aellux.uxm.preferences.mjs"),
  "state-navigation": () => import("./aellux.uxm.state-navigation.mjs"),
  "adaptive": () => import("./aellux.uxm.adaptive.mjs"),
  "feedback": () => import("./aellux.uxm.feedback.mjs"),
  "ajax-href": () => import("./aellux.uxm.ajax-href.mjs")
});
