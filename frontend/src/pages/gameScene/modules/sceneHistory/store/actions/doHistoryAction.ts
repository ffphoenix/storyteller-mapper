import type Konva from "konva";
import removeObject from "../../../sceneActions/producer/removeObject";
import modifyObject from "../../../sceneActions/producer/modifyObject";
import addObject from "../../../sceneActions/producer/addObject";

export const doHistoryAction = (
  queue: "undo" | "redo",
  stage: Konva.Stage,
  action: "add" | "modify" | "remove",
  nodes: Partial<Konva.Node>[],
  layerId: string,
  originalProps?: Partial<Konva.NodeConfig>,
  currentGroupProps?: Partial<Konva.NodeConfig>,
) => {
  const undoMapByAction = {
    add: () => removeObject(stage, nodes),
    modify: () => modifyObject(stage, layerId, nodes, originalProps, currentGroupProps),
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
