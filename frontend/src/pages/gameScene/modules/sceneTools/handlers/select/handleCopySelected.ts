import Konva from "konva";
import getTransformer from "../../../sceneTransformer/getTransformer";
import toolsStore from "../../store/ToolsStore";
import nodesToJSON from "../../../../utils/nodes/nodesToJSON";

export const handleCopySelected = (stage: Konva.Stage) => {
  const transformer = getTransformer(stage);
  if (!transformer || transformer.nodes().length === 0) return;

  const clonedNodes = transformer.nodes().map((node) => node.clone());
  toolsStore.setClipboardNodes(nodesToJSON(clonedNodes));
};
