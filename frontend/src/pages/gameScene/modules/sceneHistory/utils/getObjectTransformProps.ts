import type { SceneNode } from "../../../utils/nodes/types";
import { radiansToDegrees } from "../../../utils/nodes/sceneNodeUtils";

export const getObjectTransformProps = (object: SceneNode) => {
  const bounds = object.getBounds();
  return {
    rotation: radiansToDegrees(object.rotation),
    x: object.position.x,
    y: object.position.y,
    scaleX: object.scale.x,
    scaleY: object.scale.y,
    skewX: radiansToDegrees(object.skew.x),
    skewY: radiansToDegrees(object.skew.y),
    width: bounds.width,
    height: bounds.height,
  };
};
