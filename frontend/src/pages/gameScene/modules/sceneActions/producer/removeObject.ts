import type { PixiStage } from "../../sceneStage/pixiStage";
import type { SceneNodeJSON } from "../../../utils/nodes/types";

const removeObject = (stage: PixiStage, nodes: SceneNodeJSON[]) => {
  if (nodes.length === 0) return;
  nodes.forEach((node) => {
    const stageNode = stage.findOne(`#${node.attrs.id}`);
    stageNode?.destroy();
  });
  stage.batchDraw();
};
export default removeObject;
