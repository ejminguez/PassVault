/* @refresh reload */
import { render } from "solid-js/web";
import routes from "./routes/routes";
import { Router } from "@solidjs/router";
import App from "./App";

const root = document.getElementById("app");

render(() => <Router>{routes}</Router>, document.getElementById("root"));
