import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import { autorun } from "mobx";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import getActiveLayer from "../utils/getActiveLayer";

const getDrawPencilHandlers = (stage: Stage): MouseHandlers => {
  let isDrawing = false;
  let lastLine: Konva.Line | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    isDrawing = true;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    lastLine = new Konva.Line({
      id: generateUUID(),
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      globalCompositeOperation: "source-over",
      points: [relativePos.x, relativePos.y],
      draggable: false,
      name: "object",
    });

    const layer = getActiveLayer(stage);
    layer.add(lastLine);
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !lastLine) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    const newPoints = lastLine.points().concat([relativePos.x, relativePos.y]);
    lastLine.points(newPoints);
    stage.batchDraw();
  };

  const onMouseUp = () => {
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
