import type { MouseHandlers } from "../useSceneTools";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";

const getHandHandlers = (stage: PixiStage): MouseHandlers => {
  let isPanning = false;

  stage.container().style.cursor = "grab";

  const onMouseDown = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) return;

    isPanning = true;
    stage.container().style.cursor = "grabbing";
  };

  const onMouseMove = (e: ScenePointerEvent) => {
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

  const onMouseUp = (_e: ScenePointerEvent) => {
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
