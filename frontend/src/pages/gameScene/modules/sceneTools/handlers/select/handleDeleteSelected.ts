import getTransformer from "../../../sceneTransformer/getTransformer";
import fireObjectRemovedEvent from "../../../sceneActions/catcher/fireObjectRemovedEvent";
import type { PixiStage } from "../../../sceneStage/pixiStage";
import nodesToJSON from "../../../../utils/nodes/nodesToJSON";
import { createNodeFromJSON } from "../../../../utils/nodes/createNodeFromJSON";
import SceneStore from "../../../../store/SceneStore";

export const handleDeleteSelected = (stage: PixiStage) => {
  const transformer = getTransformer(stage);
  if (!transformer || transformer.nodes().length === 0) return;

  const transformerNodes = transformer.nodes().map((node) => createNodeFromJSON(nodesToJSON(node)[0]));
  transformer.nodes().forEach((node) => node.destroy());
  transformer.nodes([]);
  const layerId = transformer.__scene.layerId || SceneStore.activeLayerId;
  fireObjectRemovedEvent("self", transformerNodes, layerId);
  stage.batchDraw();
};
