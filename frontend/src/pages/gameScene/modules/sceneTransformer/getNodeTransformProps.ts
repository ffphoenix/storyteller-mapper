import type { SceneNode } from "../../utils/nodes/types";
import { radiansToDegrees } from "../../utils/nodes/sceneNodeUtils";
import type { SceneTransformer } from "./SceneTransformer";

const getNodeTransformProps = (node: SceneNode | SceneTransformer) => {
  if ("getBoundsData" in node) {
    const bounds = node.getBoundsData();
    return {
      x: (node.__scene.attrs.x as number) ?? bounds.x,
      y: (node.__scene.attrs.y as number) ?? bounds.y,
      width: bounds.width,
      height: bounds.height,
      scaleX: (node.__scene.attrs.scaleX as number) ?? 1,
      scaleY: (node.__scene.attrs.scaleY as number) ?? 1,
      rotation: (node.__scene.attrs.rotation as number) ?? 0,
      skewX: 0,
      skewY: 0,
      offsetX: (node.__scene.attrs.offsetX as number) ?? bounds.width / 2,
      offsetY: (node.__scene.attrs.offsetY as number) ?? bounds.height / 2,
    };
  }

  const bounds = node.getBounds();
  return {
    x: node.position.x,
    y: node.position.y,
    width: bounds.width,
    height: bounds.height,
    scaleX: node.scale.x,
    scaleY: node.scale.y,
    rotation: radiansToDegrees(node.rotation),
    skewX: radiansToDegrees(node.skew.x),
    skewY: radiansToDegrees(node.skew.y),
    offsetX: node.pivot.x,
    offsetY: node.pivot.y,
  };
};
export default getNodeTransformProps;
