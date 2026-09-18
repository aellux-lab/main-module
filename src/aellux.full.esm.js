/*! Aellux | SPDX-License-Identifier: Apache-2.0 | See LICENSE for terms. */

import "./aellux.orchestrator.js";

const root = typeof globalThis !== "undefined" ? globalThis : window;

root.Aellux.bundledModules = Object.freeze({
  "preferences": () => import("./aellux.uxm.preferences.js"),
  "state-navigation": () => import("./aellux.uxm.state-navigation.js"),
  "adaptive": () => import("./aellux.uxm.adaptive.js"),
  "feedback": () => import("./aellux.uxm.feedback.js"),
  "ajax-href": () => import("./aellux.uxm.ajax-href.js")
});
