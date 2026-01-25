import type { Stage } from "konva/lib/Stage";
import Konva from "konva";
import getActiveLayer from "../../utils/getActiveLayer";
import getNodeTransformProps from "../../../sceneTransformer/getNodeTransformProps";
import sceneTransformerStore from "../../../sceneTransformer/store/SceneTransformerStore";

export const onMouseUpSelectByArea = (stage: Stage, transformer: Konva.Transformer, selectionRectangle: Konva.Rect) => {
  setTimeout(() => {
    selectionRectangle.visible(false);
  });
  const box = selectionRectangle.getClientRect();
  const selected = getActiveLayer(stage).getChildren((node) => {
    return (
      Konva.Util.haveIntersection(box, node.getClientRect()) &&
      node.id() !== "selection-rectangle" &&
      node !== transformer
    );
  });
  selected.forEach((node) => node.setDraggable(true));
  transformer.nodes(selected);
  transformer.moveToTop();
  sceneTransformerStore.setStartProps(getNodeTransformProps(transformer));
  stage.batchDraw();
};
