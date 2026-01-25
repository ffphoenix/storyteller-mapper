import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import drawActiveLayer from "../utils/drawActiveLayer";

const getDrawRectHandlers = (stage: Stage): MouseHandlers => {
  let activeObject: Konva.Rect | null = null;
  let relativePos: Konva.Vector2d | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    relativePos = transform.point(pos);

    activeObject = new Konva.Rect({
      id: generateUUID(),
      x: relativePos.x,
      y: relativePos.y,
      width: 1,
      height: 1,
      fill: SceneStore.tools.drawTools.fillColor,
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      draggable: false,
      name: "object",
    });

    const layer = stage.findOne(`#${SceneStore.activeLayerId}`) as Konva.Layer;
    layer.add(activeObject);
    layer.draw();
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!activeObject || !relativePos) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const currentPos = transform.point(pos);

    const x = Math.min(currentPos.x, relativePos.x);
    const y = Math.min(currentPos.y, relativePos.y);
    const width = Math.abs(currentPos.x - relativePos.x);
    const height = Math.abs(currentPos.y - relativePos.y);

    activeObject.setAttrs({ x, y, width, height });
    drawActiveLayer(stage);
  };

  const onMouseUp = () => {
    if (activeObject) {
      fireObjectAddedEvent("self", activeObject);
    }
    activeObject = null;
    relativePos = null;
    stage.batchDraw();
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer: () => null,
  };
};
export default getDrawRectHandlers;
