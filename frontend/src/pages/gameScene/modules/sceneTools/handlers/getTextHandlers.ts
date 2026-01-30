import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import getActiveLayer from "../utils/getActiveLayer";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";
import { createNodeFromJSON } from "../../../utils/nodes/createNodeFromJSON";

const getTextHandlers = (stage: PixiStage): MouseHandlers => {
  const onMouseDown = (e: ScenePointerEvent) => {
    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    const text = createNodeFromJSON({
      className: "Text",
      attrs: {
        id: generateUUID(),
        x: relativePos.x,
        y: relativePos.y,
        text: "Text",
        fontSize: SceneStore.tools.textTool.fontSize,
        fontFamily: SceneStore.tools.textTool.fontFamily,
        fontWeight: SceneStore.tools.textTool.fontWeight,
        fontStyle: SceneStore.tools.textTool.fontStyle,
        fill: SceneStore.tools.textTool.color,
        draggable: true,
        name: "object",
      },
    });
    text.__scene.layerId = SceneStore.activeLayerId;

    const layer = getActiveLayer(stage);
    layer.addChild(text);
    stage.batchDraw();

    fireObjectAddedEvent("self", text);
    SceneStore.setActiveTool("select");

    // In a real Konva app, you'd handle text editing with a hidden textarea
    // This is a bit more complex than Fabric's IText.
    // For now, we just add the text.
  };

  const onMouseMove = (_e: ScenePointerEvent) => {};
  const onMouseUp = (_e: ScenePointerEvent) => {};

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer: () => null,
  };
};
export default getTextHandlers;
