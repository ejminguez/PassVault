/* @refresh reload */
import { render } from "solid-js/web";
import routes from "./routes/routes";
import { Router } from "@solidjs/router";
import "./App.scss";

render(
  () => <Router>{routes}</Router>,
  document.getElementById("root") as HTMLElement,
);
