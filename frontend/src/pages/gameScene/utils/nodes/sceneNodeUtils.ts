import type { DisplayObject } from "pixi.js";
import type { SceneNode } from "./types";

export const degreesToRadians = (deg: number) => (deg * Math.PI) / 180;
export const radiansToDegrees = (rad: number) => (rad * 180) / Math.PI;

export const isSceneNode = (node: DisplayObject | null | undefined): node is SceneNode => {
  return !!node && typeof (node as SceneNode).__scene === "object";
};

export const getSceneNodeNames = (node: SceneNode) => {
  const name = node.__scene.name ?? "";
  return name.split(" ").filter(Boolean);
};

export const hasSceneName = (node: SceneNode, name: string) => {
  return getSceneNodeNames(node).includes(name);
};
