import { type MutableRefObject, useEffect, useRef } from "react";
import SceneStore, { type Tool } from "../../store/SceneStore";
import { autorun } from "mobx";
import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import getHandHandlers from "./handlers/getHandHandlers";
import getSelectHandlers from "./handlers/getSelectHandlers";
import getEmptyHandlers from "./handlers/getEmptyHandlers";
import getDrawRectHandlers from "./handlers/getDrawRectHandlers";
import getDrawCircleHandlers from "./handlers/getDrawCircleHandlers";
import getDrawArrowHandlers from "./handlers/getDrawArrowHandlers";
import getDrawPencilHandlers from "./handlers/getDrawPencilHandlers";
import getTextHandlers from "./handlers/getTextHandlers";
import getMeasureHandlers from "./handlers/getMeasureHandlers";
import setRightClickHandler from "./setRightClickHandler";

export type MouseHandlers = {
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handlerDisposer: () => void;
};

const getMouseHandlers = (activeTool: Tool, stage: Stage): MouseHandlers => {
  const handlersMap = {
    hand: () => getHandHandlers(stage),
    select: () => getSelectHandlers(stage),
    pencil: () => getDrawPencilHandlers(stage),
    rect: () => getDrawRectHandlers(stage),
    circle: () => getDrawCircleHandlers(stage),
    arrow: () => getDrawArrowHandlers(stage),
    text: () => getTextHandlers(stage),
    measure: () => getMeasureHandlers(stage),
    moveLayer: () => getEmptyHandlers(),
  };
  return handlersMap[activeTool]() ?? getEmptyHandlers();
};

const useSceneTools = (stageRef: MutableRefObject<Stage | null>) => {
  const unsubscribeCallbackRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const autorunDispose = autorun(() => {
      unsubscribeCallbackRef.current();
      console.log("activeTool changed", SceneStore.activeTool);
      stage.container().style.cursor = "default";
      const { onMouseDown, onMouseUp, onMouseMove, handlerDisposer } = getMouseHandlers(SceneStore.activeTool, stage);

      stage.on("mousedown touchstart", onMouseDown);
      stage.on("mousemove touchmove", onMouseMove);
      stage.on("mouseup touchend", onMouseUp);

      unsubscribeCallbackRef.current = () => {
        stage.off("mousedown touchstart", onMouseDown);
        stage.off("mousemove touchmove", onMouseMove);
        stage.off("mouseup touchend", onMouseUp);
        handlerDisposer();
      };
    });

    const rightClickEventDisposer = setRightClickHandler(stage);
    return () => {
      rightClickEventDisposer();
      autorunDispose();
      unsubscribeCallbackRef.current();
    };
  });
};

export default useSceneTools;
