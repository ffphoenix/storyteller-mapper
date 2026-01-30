import getTransformer from "../../../sceneTransformer/getTransformer";
import toolsStore from "../../store/ToolsStore";
import nodesToJSON from "../../../../utils/nodes/nodesToJSON";
import type { PixiStage } from "../../../sceneStage/pixiStage";

export const handleCopySelected = (stage: PixiStage) => {
  const transformer = getTransformer(stage);
  if (!transformer || transformer.nodes().length === 0) return;

  toolsStore.setClipboardNodes(nodesToJSON(transformer.nodes()));
};
