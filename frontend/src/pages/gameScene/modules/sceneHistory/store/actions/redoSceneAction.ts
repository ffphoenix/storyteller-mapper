import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";
import { toJS } from "mobx";
import fireObjectsHistoryAction from "../../../sceneActions/catcher/fireObjectsHistoryAction";
import type { PixiStage } from "../../../sceneStage/pixiStage";

const redoSceneAction = (stageRef: MutableRefObject<PixiStage | null>) => {
  const stage = stageRef.current;
  if (!stage) return;

  const historyItem = SceneHistoryStore.latestRedoHistoryItem;
  if (!historyItem) return;

  try {
    const { nodes, action, actionType, layerId, originalGroupProps, currentGroupProps } = toJS(historyItem);
    doHistoryAction("redo", stage, action, nodes, layerId, originalGroupProps, currentGroupProps);
    SceneHistoryStore.popRedoHistoryItem();
    SceneHistoryStore.addUndoHistoryItem(
      action,
      {
        nodes,
        layerId,
        actionType,
        originalGroupProps,
        currentGroupProps,
      },
      true,
    );
    fireObjectsHistoryAction(stage, {
      historyAction: "redo",
      action,
      actionType,
      nodes,
      layerId,
      originalGroupProps: originalGroupProps || {},
      currentGroupProps: currentGroupProps || {},
    });
  } catch (e) {
    console.error(e);
    SceneHistoryStore.popRedoHistoryItem();
  }
  stage.batchDraw();
};

export default redoSceneAction;
