import GameLayout from "../../layouts/GameLayout";
import GameScenePage from "./index";
import type { RouteObject } from "react-router";

export const GameSceneRoute = {
  path: "/",
  Component: GameLayout,
  children: [
    {
      path: "",
      Component: GameScenePage,
    } as RouteObject,
  ],
};
