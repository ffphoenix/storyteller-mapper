import getActiveLayer from "../../utils/getActiveLayer";
import fireObjectAddedEvent from "../../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../../utils/uuid";
import getTransformer from "../../../sceneTransformer/getTransformer";
import toolsStore from "../../store/ToolsStore";
import clearTransformerNodesSelection from "../../../sceneTransformer/clearTransformerNodesSelection";
import type { PixiStage } from "../../../sceneStage/pixiStage";
import { createNodeFromJSON } from "../../../../utils/nodes/createNodeFromJSON";
import type { SceneNode } from "../../../../utils/nodes/types";
import nodesToJSON from "../../../../utils/nodes/nodesToJSON";

export const handlePasteSelected = (stage: PixiStage) => {
  const clipboardNodes = toolsStore.select.clipboardNodes;
  if (!clipboardNodes || clipboardNodes.length === 0) return;

  const activeLayer = getActiveLayer(stage);
  if (!activeLayer) return;

  const newNodes: SceneNode[] = [];
  const offset = 20;
  // TODO: add cursor position offset
  clipboardNodes.forEach((nodeConfig) => {
    const newNode = createNodeFromJSON(nodeConfig);
    const newId = generateUUID();
    newNode.__scene.id = newId;
    newNode.__scene.attrs.id = newId;
    newNode.__scene.layerId = activeLayer.__scene.id;
    newNode.position.set(newNode.position.x + offset, newNode.position.y + offset);
    newNode.__scene.attrs.x = newNode.position.x;
    newNode.__scene.attrs.y = newNode.position.y;
    activeLayer.addChild(newNode);
    newNodes.push(newNode);
  });

  const transformer = getTransformer(stage);
  if (transformer) {
    clearTransformerNodesSelection(stage);
    transformer.nodes(newNodes);
    transformer.moveToTop();
  }

  stage.batchDraw();
  fireObjectAddedEvent("self", newNodes);

  // Update clipboard with new positions so consecutive pastes stack
  toolsStore.setClipboardNodes(nodesToJSON(newNodes));
};
