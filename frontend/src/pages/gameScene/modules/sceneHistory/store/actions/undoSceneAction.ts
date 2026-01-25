import type Konva from "konva";
import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";
import { toJS } from "mobx";
import fireObjectsHistoryAction from "../../../sceneActions/catcher/fireObjectsHistoryAction";

const undoSceneAction = (stageRef: MutableRefObject<Konva.Stage | null>) => {
  const stage = stageRef.current;
  if (!stage) return;

  const historyItem = SceneHistoryStore.latestUndoHistoryItem;
  if (!historyItem) return;
  if (historyItem.action === "modify" && !historyItem.originalGroupProps) return;

  try {
    const { nodes, action, actionType, layerId, originalGroupProps, currentGroupProps } = toJS(historyItem);
    console.log("undo", action, nodes, layerId, originalGroupProps);
    doHistoryAction("undo", stage, action, nodes, layerId, originalGroupProps, currentGroupProps);

    SceneHistoryStore.popUndoHistoryItem();
    SceneHistoryStore.addRedoHistoryItem(action, {
      nodes,
      layerId,
      actionType,
      originalGroupProps: currentGroupProps,
      currentGroupProps: originalGroupProps,
    });
    fireObjectsHistoryAction(stage, {
      historyAction: "undo",
      action,
      actionType,
      nodes,
      layerId,
      originalGroupProps: currentGroupProps || {},
      currentGroupProps: originalGroupProps || {},
    });
  } catch (e) {
    console.error(e);
    SceneHistoryStore.popUndoHistoryItem();
  }
  stage.batchDraw();
};
export default undoSceneAction;
