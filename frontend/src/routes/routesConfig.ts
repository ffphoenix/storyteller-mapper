import { type RouteObject } from "react-router";
import GameLayout from "../layouts/GameLayout";
import GameScenePage from "../pages/gameScene";

const routes: RouteObject[] = [
  {
    path: "/",
    loader() {
      return null;
    },
    Component: GameLayout,
    children: [
      {
        path: "/",
        Component: GameScenePage,
      },
    ],
  },

];
export default routes;
