import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import getActiveLayer from "../utils/getActiveLayer";
import drawActiveLayer from "../utils/drawActiveLayer";

const getDrawArrowHandlers = (stage: Stage): MouseHandlers => {
  stage.container().style.cursor = "crosshair";
  let arrowState: { start: Konva.Vector2d; line: Konva.Line; head: Konva.RegularPolygon } | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    const line = new Konva.Line({
      points: [relativePos.x, relativePos.y, relativePos.x, relativePos.y],
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      listening: false,
    });

    const headSize = Math.max(8, SceneStore.tools.drawTools.strokeWidth * 4);
    const head = new Konva.RegularPolygon({
      x: relativePos.x,
      y: relativePos.y,
      sides: 3,
      radius: headSize,
      fill: SceneStore.tools.drawTools.strokeColor,
      listening: false,
    });

    const layer = getActiveLayer(stage);
    layer.add(line);
    layer.add(head);
    arrowState = { start: relativePos, line, head };
    layer.draw();
  };

  const onMouseMove = () => {
    if (!arrowState) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    const { start, line, head } = arrowState;
    line.points([start.x, start.y, relativePos.x, relativePos.y]);

    const dx = relativePos.x - start.x;
    const dy = relativePos.y - start.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    head.position({ x: relativePos.x, y: relativePos.y });
    head.rotation(angle);
    drawActiveLayer(stage);
  };

  const onMouseUp = () => {
    if (!arrowState) return;

    const { line, head, start } = arrowState;
    const points = line.points();
    const endX = points[2];
    const endY = points[3];
    const dx = endX - start.x;
    const dy = endY - start.y;
    const distance = Math.hypot(dx, dy);

    line.destroy();
    head.destroy();
    arrowState = null;

    if (distance < 2) {
      drawActiveLayer(stage);
      return;
    }

    const group = new Konva.Group({
      id: generateUUID(),
      draggable: false,
      name: "object arrow",
    });

    const finalLine = new Konva.Line({
      points: [start.x, start.y, endX, endY],
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
    });

    const headSize = Math.max(8, SceneStore.tools.drawTools.strokeWidth * 4);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const finalHead = new Konva.RegularPolygon({
      x: endX,
      y: endY,
      sides: 3,
      radius: headSize,
      fill: SceneStore.tools.drawTools.strokeColor,
      rotation: angle,
    });

    group.add(finalLine);
    group.add(finalHead);

    const layer = getActiveLayer(stage);
    layer.add(group);
    layer.draw();
    fireObjectAddedEvent("self", group);
  };

  const handlerDisposer = () => {
    if (arrowState) {
      const { line, head } = arrowState;
      line.destroy();
      head.destroy();
      arrowState = null;
      drawActiveLayer(stage);
    }
    stage.container().style.cursor = "default";
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer,
  };
};
export default getDrawArrowHandlers;
