import Konva from "konva";
import SceneStore, { type Tool } from "../../store/SceneStore";
import type { Stage } from "konva/lib/Stage";
import { toJS } from "mobx";

// TODO: refactor name and place of this function
const setRightClickHandler = (stage: Stage) => {
  let isPanning = false;
  let rightButtonDown = false;
  let startPos: { x: number; y: number } | null = null;
  let savedActiveTool: Tool | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const event = e.evt;
    if (event.button === 2) {
      rightButtonDown = true;
      startPos = { x: event.clientX, y: event.clientY };
    }
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const event = e.evt;

    if (!rightButtonDown) return;
    if (!startPos) return;

    const dx = Math.abs(event.clientX - startPos.x);
    const dy = Math.abs(event.clientY - startPos.y);
    if (dx >= 2 || dy >= 2) {
      if (!isPanning) {
        savedActiveTool = toJS(SceneStore.activeTool);
        SceneStore.setActiveTool("hand");
      }

      isPanning = true;
      stage.container().style.cursor = "grabbing";

      const newPos = {
        x: stage.x() + event.movementX,
        y: stage.y() + event.movementY,
      };
      stage.position(newPos);
      stage.batchDraw();
    }
  };

  const onMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const event = e.evt;
    if (!rightButtonDown || event.button !== 2) return;

    rightButtonDown = false;
    console.log("right button up", savedActiveTool);
    if (savedActiveTool) {
      SceneStore.setActiveTool(savedActiveTool);
      savedActiveTool = null;
    }
    const activeTool = SceneStore.activeTool;
    stage.container().style.cursor = activeTool === "hand" ? "grab" : "default";
    stage.batchDraw();

    if (isPanning) {
      isPanning = false;
      startPos = null;
      return;
    }
    SceneStore.setContextMenu(true, event.clientX, event.clientY);
  };
  // TODO: add mouse out of window handler
  stage.on("mousedown", onMouseDown);
  stage.on("mousemove", onMouseMove);
  stage.on("mouseup", onMouseUp);

  return () => {
    stage.off("mousedown", onMouseDown);
    stage.off("mousemove", onMouseMove);
    stage.off("mouseup", onMouseUp);
  };
};
export default setRightClickHandler;
