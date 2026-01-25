import { type MutableRefObject, useEffect } from "react";
import SceneHistoryStore from "./store/SceneHistoryStore";
import type Konva from "konva";
import isKeyDownInterceptable from "../../utils/isKeyDownInterceptable";
import undoSceneAction from "./store/actions/undoSceneAction";
import redoSceneAction from "./store/actions/redoSceneAction";
import type { SceneActionEvent } from "../sceneActions/types";
import nodesToJSON from "../../utils/nodes/nodesToJSON";
import getNodeTransformProps from "../sceneTransformer/getNodeTransformProps";

export default function useSceneHistory(stageRef: MutableRefObject<Konva.Stage | null>) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onObjectAdded = (e: CustomEvent<SceneActionEvent>) => {
      if (e.detail.producer !== "self") return;
      const { nodes, layerId } = e.detail;
      SceneHistoryStore.addUndoHistoryItem("add", { nodes: nodesToJSON(nodes), layerId });
    };
    document.addEventListener("sc:object:added", onObjectAdded as EventListener);

    const onObjectModified = (e: CustomEvent<SceneActionEvent>) => {
      if (e.detail.producer !== "self") return;
      const { layerId, actionType, originalProps, transformer, nodes } = e.detail;
      if (!transformer) throw new Error("Transformer is required");
      SceneHistoryStore.addUndoHistoryItem("modify", {
        nodes: nodesToJSON(transformer.nodes()),
        layerId,
        actionType,
        // @TODO fix this, find graceful realization
        currentGroupProps: { ...getNodeTransformProps(nodes as Konva.Shape), x: transformer.x(), y: transformer.y() },
        originalGroupProps: originalProps,
      });
    };
    document.addEventListener("sc:object:modified", onObjectModified as EventListener);

    const onObjectRemoved = (e: CustomEvent<SceneActionEvent>) => {
      const { nodes, layerId, producer } = e.detail;
      if (producer !== "self") return;
      SceneHistoryStore.addUndoHistoryItem("remove", { nodes: nodesToJSON(nodes), layerId });
    };
    document.addEventListener("sc:object:removed", onObjectRemoved as EventListener);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKeyDownInterceptable(e, stage)) return;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.code === "KeyZ") {
        console.log(`[history][ctrl + z][shift: ${e.shiftKey}]`);

        if (e.shiftKey) {
          redoSceneAction(stageRef);
        } else {
          undoSceneAction(stageRef);
        }

        e.preventDefault();
        return;
      }
      if (isCtrlOrMeta && e.code === "KeyY") {
        redoSceneAction(stageRef);
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("sc:object:added", onObjectAdded as EventListener);
      document.removeEventListener("sc:object:modified", onObjectModified as EventListener);
      document.removeEventListener("sc:object:removed", onObjectRemoved as EventListener);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
