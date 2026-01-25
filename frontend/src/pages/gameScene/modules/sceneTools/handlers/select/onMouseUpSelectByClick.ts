import type { Stage } from "konva/lib/Stage";
import Konva from "konva";
import clearTransformerNodesSelection from "../../../sceneTransformer/clearTransformerNodesSelection";
import drawActiveLayer from "../../utils/drawActiveLayer";
import getNodeTransformProps from "../../../sceneTransformer/getNodeTransformProps";
import sceneTransformerStore from "../../../sceneTransformer/store/SceneTransformerStore";

export const onMouseUpSelectByClick = (
  stage: Stage,
  e: Konva.KonvaEventObject<MouseEvent>,
  transformer: Konva.Transformer,
) => {
  const node = e.target as Konva.Node;
  // clicked on transformer - do nothing
  if (node.getParent() === transformer || node === transformer) {
    return;
  }

  // clicked on empty area - remove all selections
  if (node === stage) {
    clearTransformerNodesSelection(stage);
    return;
  }

  // click on non-object
  if (!node.hasName("object")) {
    clearTransformerNodesSelection(stage);
    return;
  }
  node.setDraggable(true);

  // clicked on some node
  const isSelected = transformer.nodes().includes(node);

  if (!e.evt.shiftKey && !isSelected) {
    // select only one
    clearTransformerNodesSelection(stage);
    transformer.nodes([node]);
  } else if (e.evt.shiftKey && isSelected) {
    // remove from selection
    const nodes = transformer.nodes().slice(); // clone array
    nodes.splice(nodes.indexOf(node), 1);
    node.setDraggable(false);
    transformer.nodes(nodes);
  } else if (e.evt.shiftKey && !isSelected) {
    // add to selection
    const nodes = transformer.nodes().concat([node]);
    transformer.nodes(nodes);
  }
  stage.batchDraw();
  sceneTransformerStore.setStartProps(getNodeTransformProps(transformer));
  drawActiveLayer(stage);
  transformer.moveToTop();
};
