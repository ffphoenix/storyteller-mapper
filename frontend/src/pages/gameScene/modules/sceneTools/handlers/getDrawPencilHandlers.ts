import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import getActiveLayer from "../utils/getActiveLayer";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";
import { createNodeFromJSON, updateNodeGeometry } from "../../../utils/nodes/createNodeFromJSON";
import type { SceneNode } from "../../../utils/nodes/types";

const getDrawPencilHandlers = (stage: PixiStage): MouseHandlers => {
  let isDrawing = false;
  let lastLine: SceneNode | null = null;

  const onMouseDown = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) return;

    isDrawing = true;
    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    lastLine = createNodeFromJSON({
      className: "Line",
      attrs: {
        id: generateUUID(),
        stroke: SceneStore.tools.drawTools.strokeColor,
        strokeWidth: SceneStore.tools.drawTools.strokeWidth,
        points: [relativePos.x, relativePos.y],
        draggable: false,
        name: "object",
      },
    });
    lastLine.__scene.layerId = SceneStore.activeLayerId;

    const layer = getActiveLayer(stage);
    layer.addChild(lastLine);
  };

  const onMouseMove = (_e: ScenePointerEvent) => {
    if (!isDrawing || !lastLine) return;

    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    const newPoints = (lastLine.__scene.attrs.points ?? []).concat([relativePos.x, relativePos.y]);
    lastLine.__scene.attrs.points = newPoints;
    updateNodeGeometry(lastLine);
    stage.batchDraw();
  };

  const onMouseUp = (_e: ScenePointerEvent) => {
    if (isDrawing && lastLine) {
      fireObjectAddedEvent("self", lastLine);
    }
    isDrawing = false;
    lastLine = null;
  };

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handlerDisposer: () => null,
  };
};
export default getDrawPencilHandlers;
