import GameLayout from "../../layouts/GameLayout";
import GameScenePage from "./index";
import loadScene from "./store/actions/loadScene";
import type { RouteObject } from "react-router";

export const GameSceneRoute = {
  path: "play",
  Component: GameLayout,
  children: [
    {
      path: ":gameId",
      loader: async ({ params }) => {
        if (!params.gameId) return;
        await loadScene(params.gameId);
      },
      Component: GameScenePage,
    } as RouteObject,
  ],
};
