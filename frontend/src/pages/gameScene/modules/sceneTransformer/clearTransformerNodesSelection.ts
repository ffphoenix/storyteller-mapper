import drawActiveLayer from "../sceneTools/utils/drawActiveLayer";
import getTransformer from "./getTransformer";
import type { PixiStage } from "../sceneStage/pixiStage";

const clearTransformerNodesSelection = (stage: PixiStage) => {
  const transformer = getTransformer(stage);
  if (transformer.nodes().length === 0) return;
  transformer.nodes().forEach((node) => {
    node.eventMode = "static";
  });
  transformer.nodes([]);
  drawActiveLayer(stage);
};
export default clearTransformerNodesSelection;
