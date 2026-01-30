import clearTransformerNodesSelection from "../../../sceneTransformer/clearTransformerNodesSelection";
import drawActiveLayer from "../../utils/drawActiveLayer";
import getNodeTransformProps from "../../../sceneTransformer/getNodeTransformProps";
import sceneTransformerStore from "../../../sceneTransformer/store/SceneTransformerStore";
import type { PixiStage, ScenePointerEvent } from "../../../sceneStage/pixiStage";
import type { SceneTransformer } from "../../../sceneTransformer/SceneTransformer";
import { hasSceneName, isSceneNode } from "../../../../utils/nodes/sceneNodeUtils";

export const onMouseUpSelectByClick = (stage: PixiStage, e: ScenePointerEvent, transformer: SceneTransformer) => {
  let node = e.target;
  if (!node) {
    clearTransformerNodesSelection(stage);
    return;
  }

  if (!hasSceneName(node, "object")) {
    let parent = node.parent;
    while (parent) {
      if (isSceneNode(parent) && hasSceneName(parent, "object")) {
        node = parent;
        break;
      }
      parent = parent.parent;
    }
  }

  if (!node || !hasSceneName(node, "object")) {
    clearTransformerNodesSelection(stage);
    return;
  }

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
    node.eventMode = "static";
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
