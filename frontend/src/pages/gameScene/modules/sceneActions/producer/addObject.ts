import type { PixiStage } from "../../sceneStage/pixiStage";
import type { SceneNodeJSON } from "../../../utils/nodes/types";
import { createNodeFromJSON } from "../../../utils/nodes/createNodeFromJSON";

const addObject = (stage: PixiStage, nodes: SceneNodeJSON[], layerId: string) => {
  const layer = stage.getLayerById(layerId);
  if (!layer) {
    console.error(`Layer with id ${layerId} not found in stage`);
    return;
  }
  nodes.forEach((nodeJSON) => {
    const node = createNodeFromJSON(nodeJSON);
    node.__scene.layerId = layerId;
    layer.addChild(node);
  });
  stage.batchDraw();
};

export default addObject;
