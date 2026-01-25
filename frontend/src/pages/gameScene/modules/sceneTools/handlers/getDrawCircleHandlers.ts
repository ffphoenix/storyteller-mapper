import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import drawActiveLayer from "../utils/drawActiveLayer";

const getDrawCircleHandlers = (stage: Stage): MouseHandlers => {
  let activeObject: Konva.Circle | null = null;
  let relativePos: Konva.Vector2d | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    relativePos = transform.point(pos);

    activeObject = new Konva.Circle({
      id: generateUUID(),
      x: relativePos.x,
      y: relativePos.y,
      radius: 1,
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

    const dx = currentPos.x - relativePos.x;
    const dy = currentPos.y - relativePos.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    activeObject.radius(r);
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
export default getDrawCircleHandlers;
