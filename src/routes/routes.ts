import { lazy } from "solid-js";

const routes = [
  {
    path: "/",
    component: lazy(() => import("../views/Dashboard")),
  },
  {
    path: "/settings",
    component: lazy(() => import("../views/Settings")),
  },
  {
    path: "/login",
    component: lazy(() => import("../views/Login")),
  },
];

export default routes;
