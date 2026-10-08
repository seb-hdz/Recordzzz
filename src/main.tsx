import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { routes } from "@generouted/solid-router";
import "./css/style.css";

const root = document.getElementById("root");

/** Solid Router base has no trailing slash; Vite BASE_URL always has one. */
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

if (root) {
  render(
    () => (
      <Router {...(routerBase ? { base: routerBase } : {})}>{routes}</Router>
    ),
    root
  );
}
