import Konva from "konva";

const getNodeTransformProps = (node: Konva.Node) => {
  return {
    x: node.x(),
    y: node.y(),
    width: node.width(),
    height: node.height(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
    rotation: node.rotation(),
    skewX: node.skewX(),
    skewY: node.skewY(),
    offsetX: node.offsetX(),
    offsetY: node.offsetY(),
  };
};
export default getNodeTransformProps;
