import removeObject from "../../../sceneActions/producer/removeObject";
import modifyObject from "../../../sceneActions/producer/modifyObject";
import addObject from "../../../sceneActions/producer/addObject";
import type { SceneNodeJSON } from "../../../../utils/nodes/types";
import type { TransformProps } from "../../../sceneTransformer/types";
import type { PixiStage } from "../../../sceneStage/pixiStage";

export const doHistoryAction = (
  queue: "undo" | "redo",
  stage: PixiStage,
  action: "add" | "modify" | "remove",
  nodes: SceneNodeJSON[],
  layerId: string,
  originalProps?: TransformProps,
  currentGroupProps?: TransformProps,
) => {
  const undoMapByAction = {
    add: () => removeObject(stage, nodes),
    modify: () => modifyObject(stage, layerId, nodes, currentGroupProps, originalProps),
    remove: () => addObject(stage, nodes, layerId),
  };

  const redoMapByAction = {
    add: () => addObject(stage, nodes, layerId),
    modify: () => modifyObject(stage, layerId, nodes, originalProps, currentGroupProps),
    remove: () => removeObject(stage, nodes),
  };

  const actionMap = queue === "undo" ? undoMapByAction : redoMapByAction;
  const actionFunction = actionMap[action];
  if (!action) throw new Error(`Cannot perform action ${action}`);
  actionFunction();
};
export default doHistoryAction;
