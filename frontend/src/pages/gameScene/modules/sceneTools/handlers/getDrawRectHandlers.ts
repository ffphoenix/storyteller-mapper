import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import drawActiveLayer from "../utils/drawActiveLayer";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";
import { createNodeFromJSON, updateNodeGeometry } from "../../../utils/nodes/createNodeFromJSON";
import type { SceneNode } from "../../../utils/nodes/types";

const getDrawRectHandlers = (stage: PixiStage): MouseHandlers => {
  let activeObject: SceneNode | null = null;
  let relativePos: { x: number; y: number } | null = null;

  const onMouseDown = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) return;

    const pos = stage.getWorldPointerPosition();
    if (!pos) return;

    relativePos = pos;

    activeObject = createNodeFromJSON({
      className: "Rect",
      attrs: {
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
      },
    });
    activeObject.__scene.layerId = SceneStore.activeLayerId;

    const layer = stage.getLayerById(SceneStore.activeLayerId);
    if (!layer) return;
    layer.addChild(activeObject);
    stage.batchDraw();
  };

  const onMouseMove = (_e: ScenePointerEvent) => {
    if (!activeObject || !relativePos) return;

    const currentPos = stage.getWorldPointerPosition();
    if (!currentPos) return;

    const x = Math.min(currentPos.x, relativePos.x);
    const y = Math.min(currentPos.y, relativePos.y);
    const width = Math.abs(currentPos.x - relativePos.x);
    const height = Math.abs(currentPos.y - relativePos.y);

    activeObject.position.set(x, y);
    activeObject.__scene.attrs.x = x;
    activeObject.__scene.attrs.y = y;
    activeObject.__scene.attrs.width = width;
    activeObject.__scene.attrs.height = height;
    updateNodeGeometry(activeObject);
    drawActiveLayer(stage);
  };

  const onMouseUp = (_e: ScenePointerEvent) => {
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
