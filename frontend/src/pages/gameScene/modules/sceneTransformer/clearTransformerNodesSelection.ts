import Konva from "konva";
import drawActiveLayer from "../sceneTools/utils/drawActiveLayer";
import getTransformer from "./getTransformer";

const clearTransformerNodesSelection = (stage: Konva.Stage) => {
  const transformer = getTransformer(stage);
  if (transformer.nodes().length === 0) return;
  transformer.nodes().forEach((node: Konva.Node) => node.setDraggable(false));
  transformer.nodes([]);
  drawActiveLayer(stage);
};
export default clearTransformerNodesSelection;
