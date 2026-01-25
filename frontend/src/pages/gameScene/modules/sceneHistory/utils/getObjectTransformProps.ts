import type Konva from "konva";

export const getObjectTransformProps = (object: Konva.Node) => {
  return {
    rotation: object.rotation(),
    x: object.x(),
    y: object.y(),
    scaleX: object.scaleX(),
    scaleY: object.scaleY(),
    skewX: object.skewX(),
    skewY: object.skewY(),
    width: object.width(),
    height: object.height(),
  };
};
