import type { DisplayObject } from "pixi.js";
import { radiansToDegrees } from "./sceneNodeUtils";
import type { SceneNode, SceneNodeJSON } from "./types";
import { isSceneNode } from "./sceneNodeUtils";

const serializeNode = (node: SceneNode): SceneNodeJSON => {
  const attrs = { ...node.__scene.attrs };
  attrs.id = node.__scene.id;
  attrs.name = node.__scene.name ?? node.name ?? attrs.name;
  attrs.layerId = node.__scene.layerId ?? attrs.layerId;
  attrs.x = node.position.x;
  attrs.y = node.position.y;
  attrs.scaleX = node.scale.x;
  attrs.scaleY = node.scale.y;
  attrs.rotation = radiansToDegrees(node.rotation);
  attrs.skewX = radiansToDegrees(node.skew.x);
  attrs.skewY = radiansToDegrees(node.skew.y);
  attrs.offsetX = node.pivot.x;
  attrs.offsetY = node.pivot.y;

  const children =
    node.__scene.className === "Group"
      ? node.children
          .map((child) => (isSceneNode(child as DisplayObject) ? serializeNode(child as SceneNode) : null))
          .filter((child): child is SceneNodeJSON => !!child)
      : undefined;

  return {
    className: node.__scene.className,
    attrs,
    children,
  };
};

const nodesToJSON = (objects: SceneNode | SceneNode[]): SceneNodeJSON[] => {
  if (Array.isArray(objects)) {
    return objects.map((obj) => serializeNode(obj));
  }
  return [serializeNode(objects)];
};
export default nodesToJSON;
