import { type MutableRefObject, useEffect } from "react";
import SceneStore from "../../store/SceneStore";
import { MAX_ZOOM, MIN_ZOOM } from "../../constants/uiConstants";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage } from "konva/lib/Stage";

const onWheel = (stage: Stage, e: KonvaEventObject<WheelEvent>) => {
  const event = e.evt;
  const oldZoom = stage.scaleX();
  const delta = event.deltaY;
  // TODO: fix factor number and set some proper steps for scroll
  const factor = 0.999 ** delta;

  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * factor));
  SceneStore.setCurrentZoom(newZoom);

  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldZoom,
    y: (pointer.y - stage.y()) / oldZoom,
  };

  stage.scale({ x: newZoom, y: newZoom });

  const newPos = {
    x: pointer.x - mousePointTo.x * newZoom,
    y: pointer.y - mousePointTo.y * newZoom,
  };
  stage.position(newPos);
  stage.batchDraw();

  event.preventDefault();
  event.stopPropagation();
};

export default (stageRef: MutableRefObject<Stage | null>) => {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheelHandler = (e: KonvaEventObject<WheelEvent>) => onWheel(stage, e);
    stage.on("wheel", onWheelHandler);

    return () => {
      stage.off("wheel", onWheelHandler);
    };
  }, []);
};
