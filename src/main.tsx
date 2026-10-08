import { render } from "solid-js/web";
import { Routes } from "@generouted/solid-router";
import "./css/style.css";

const root = document.getElementById("root");

if (root) {
  render(() => <Routes />, root);
}
