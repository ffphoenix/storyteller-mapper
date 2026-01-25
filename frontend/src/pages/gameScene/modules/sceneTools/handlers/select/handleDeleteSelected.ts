import Konva from "konva";
import getTransformer from "../../../sceneTransformer/getTransformer";
import fireObjectRemovedEvent from "../../../sceneActions/catcher/fireObjectRemovedEvent";

export const handleDeleteSelected = (stage: Konva.Stage) => {
  const transformer = getTransformer(stage);
  const transformerLayer = transformer.getLayer();
  if (!transformer || !transformerLayer || transformer.nodes().length === 0) return;

  const transformerNodes = transformer.nodes().map((node) => node.clone());
  transformer.nodes().forEach((node) => node.destroy());
  transformer.nodes([]);
  fireObjectRemovedEvent("self", transformerNodes, transformerLayer.id());
  stage.batchDraw();
};
