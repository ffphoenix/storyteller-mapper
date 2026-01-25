import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import getActiveLayer from "../utils/getActiveLayer";

const getTextHandlers = (stage: Stage): MouseHandlers => {
  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    const text = new Konva.Text({
      id: generateUUID(),
      x: relativePos.x,
      y: relativePos.y,
      text: "Text",
      fontSize: SceneStore.tools.textTool.fontSize,
      fill: SceneStore.tools.textTool.color,
      draggable: true,
      name: "object",
    });

    const layer = getActiveLayer(stage);
    layer.add(text);
    layer.batchDraw();

    fireObjectAddedEvent("self", text);
    SceneStore.setActiveTool("select");

    // In a real Konva app, you'd handle text editing with a hidden textarea
    // This is a bit more complex than Fabric's IText.
    // For now, we just add the text.
  };

  const onMouseMove = () => {};
  const onMouseUp = () => {};

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer: () => null,
  };
};
export default getTextHandlers;
