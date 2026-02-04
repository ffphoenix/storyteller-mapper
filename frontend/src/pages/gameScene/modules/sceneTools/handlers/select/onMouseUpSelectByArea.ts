import getActiveLayer from "../../utils/getActiveLayer";
import getNodeTransformProps from "../../../sceneTransformer/getNodeTransformProps";
import sceneTransformerStore from "../../../sceneTransformer/store/SceneTransformerStore";
import type { PixiStage } from "../../../sceneStage/pixiStage";
import type { SceneTransformer } from "../../../sceneTransformer/SceneTransformer";
import type { SceneNode } from "../../../../utils/nodes/types";
import { isSceneNode } from "../../../../utils/nodes/sceneNodeUtils";

const haveIntersection = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => {
  return !(a.x > b.x + b.width || a.x + a.width < b.x || a.y > b.y + b.height || a.y + a.height < b.y);
};

export const onMouseUpSelectByArea = (
  stage: PixiStage,
  transformer: SceneTransformer,
  selectionRectangle: SceneNode,
) => {
  setTimeout(() => {
    selectionRectangle.visible = false;
  });
  const box = selectionRectangle.getBounds();
  const selected = getActiveLayer(stage).children.filter((node) => {
    if (!isSceneNode(node)) return false;
    if (node.__scene.id === "selection-rectangle") return false;
    if (node === transformer) return false;
    const nodeBounds = node.getBounds();
    return haveIntersection(box, nodeBounds);
  }) as SceneNode[];

  transformer.nodes(selected);
  transformer.moveToTop();
  sceneTransformerStore.setStartProps(getNodeTransformProps(transformer));
  stage.batchDraw();
};
