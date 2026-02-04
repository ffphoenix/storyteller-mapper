import type { MouseHandlers } from "../useSceneTools";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../../utils/uuid";
import getActiveLayer from "../utils/getActiveLayer";
import drawActiveLayer from "../utils/drawActiveLayer";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";
import { createNodeFromJSON, updateNodeGeometry } from "../../../utils/nodes/createNodeFromJSON";
import type { SceneNode } from "../../../utils/nodes/types";
import { degreesToRadians } from "../../../utils/nodes/sceneNodeUtils";
import { Container } from "pixi.js";

const getDrawArrowHandlers = (stage: PixiStage): MouseHandlers => {
  stage.container().style.cursor = "crosshair";
  let arrowState: { start: { x: number; y: number }; line: SceneNode; head: SceneNode } | null = null;

  const onMouseDown = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) return;

    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    const line = createNodeFromJSON({
      className: "Line",
      attrs: {
        points: [relativePos.x, relativePos.y, relativePos.x, relativePos.y],
        stroke: SceneStore.tools.drawTools.strokeColor,
        strokeWidth: SceneStore.tools.drawTools.strokeWidth,
        name: "arrow-temp",
      },
    });

    const headSize = Math.max(8, SceneStore.tools.drawTools.strokeWidth * 4);
    const head = createNodeFromJSON({
      className: "RegularPolygon",
      attrs: {
        x: relativePos.x,
        y: relativePos.y,
        sides: 3,
        radius: headSize,
        fill: SceneStore.tools.drawTools.strokeColor,
        name: "arrow-temp",
      },
    });

    const layer = getActiveLayer(stage);
    layer.addChild(line);
    layer.addChild(head);
    arrowState = { start: relativePos, line, head };
    stage.batchDraw();
  };

  const onMouseMove = (_e: ScenePointerEvent) => {
    if (!arrowState) return;

    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    const { start, line, head } = arrowState;
    line.__scene.attrs.points = [start.x, start.y, relativePos.x, relativePos.y];
    updateNodeGeometry(line);

    const dx = relativePos.x - start.x;
    const dy = relativePos.y - start.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    head.position.set(relativePos.x, relativePos.y);
    head.__scene.attrs.x = relativePos.x;
    head.__scene.attrs.y = relativePos.y;
    head.__scene.attrs.rotation = angle;
    head.rotation = degreesToRadians(angle);
    drawActiveLayer(stage);
  };

  const onMouseUp = (_e: ScenePointerEvent) => {
    if (!arrowState) return;

    const { line, head, start } = arrowState;
    const points = line.__scene.attrs.points ?? [];
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

    const group = new Container() as SceneNode;
    const groupId = generateUUID();
    group.__scene = {
      id: groupId,
      className: "Group",
      name: "object arrow",
      layerId: SceneStore.activeLayerId,
      attrs: {
        id: groupId,
        draggable: false,
        name: "object arrow",
      },
    };
    group.eventMode = "static";
    group.name = "object arrow";

    const finalLine = createNodeFromJSON({
      className: "Line",
      attrs: {
        points: [start.x, start.y, endX, endY],
        stroke: SceneStore.tools.drawTools.strokeColor,
        strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      },
    });

    const headSize = Math.max(8, SceneStore.tools.drawTools.strokeWidth * 4);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const finalHead = createNodeFromJSON({
      className: "RegularPolygon",
      attrs: {
        x: endX,
        y: endY,
        sides: 3,
        radius: headSize,
        fill: SceneStore.tools.drawTools.strokeColor,
        rotation: angle,
      },
    });

    finalHead.rotation = degreesToRadians(angle);

    group.addChild(finalLine);
    group.addChild(finalHead);

    const layer = getActiveLayer(stage);
    layer.addChild(group);
    stage.batchDraw();
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
