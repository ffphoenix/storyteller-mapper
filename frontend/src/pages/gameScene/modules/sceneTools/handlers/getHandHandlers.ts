import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";

const getHandHandlers = (stage: Stage): MouseHandlers => {
  let isPanning = false;

  stage.container().style.cursor = "grab";

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    isPanning = true;
    stage.container().style.cursor = "grabbing";
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning) return;
    stage.container().style.cursor = "grabbing";

    const evt = e.evt;
    const newPos = {
      x: stage.x() + evt.movementX,
      y: stage.y() + evt.movementY,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  const onMouseUp = () => {
    isPanning = false;
    stage.container().style.cursor = "grab";
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer: () => {
      stage.container().style.cursor = "default";
    },
  };
};
export default getHandHandlers;
