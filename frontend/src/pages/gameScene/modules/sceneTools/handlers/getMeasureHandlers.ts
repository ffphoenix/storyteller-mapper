import type { MouseHandlers } from "../useSceneTools";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";
import { createNodeFromJSON, updateNodeGeometry } from "../../../utils/nodes/createNodeFromJSON";
import type { SceneNode } from "../../../utils/nodes/types";
import { degreesToRadians } from "../../../utils/nodes/sceneNodeUtils";

const getMeasureHandlers = (stage: PixiStage): MouseHandlers => {
  stage.container().style.cursor = "crosshair";
  let measuringState: {
    start: { x: number; y: number };
    line: SceneNode;
    arrow: SceneNode;
    label: SceneNode;
  } | null = null;

  const onMouseDown = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) return;

    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    if (!measuringState) {
      // start
      const red = "#ef4444"; // tailwind red-500
      const line = createNodeFromJSON({
        className: "Line",
        attrs: {
          points: [relativePos.x, relativePos.y, relativePos.x, relativePos.y],
          stroke: red,
          strokeWidth: 2,
        },
      });
      const arrow = createNodeFromJSON({
        className: "RegularPolygon",
        attrs: {
          x: relativePos.x,
          y: relativePos.y,
          sides: 3,
          radius: 6,
          fill: red,
        },
      });
      const label = createNodeFromJSON({
        className: "Text",
        attrs: {
          x: relativePos.x,
          y: relativePos.y,
          text: "0 px",
          fontSize: 14,
          fill: red,
        },
      });
      const layer = stage.getLayers()[0];
      layer.addChild(line);
      layer.addChild(arrow);
      layer.addChild(label);
      measuringState = { start: relativePos, line, arrow, label };
      stage.batchDraw();
    } else {
      // finish and clear temp objects
      const { line, arrow, label } = measuringState;
      line.destroy();
      arrow.destroy();
      label.destroy();
      measuringState = null;
      stage.batchDraw();
    }
  };

  const onMouseMove = (_e: ScenePointerEvent) => {
    if (!measuringState) return;

    const relativePos = stage.getWorldPointerPosition();
    if (!relativePos) return;

    const { start, line, arrow, label } = measuringState;
    // update line end
    line.__scene.attrs.points = [start.x, start.y, relativePos.x, relativePos.y];
    updateNodeGeometry(line);
    // compute distance
    const dx = relativePos.x - start.x;
    const dy = relativePos.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    label.__scene.attrs.text = `${Math.round(dist)} px`;
    updateNodeGeometry(label);
    // position label at midpoint with slight offset perpendicular to line
    const midX = (start.x + relativePos.x) / 2;
    const midY = (start.y + relativePos.y) / 2;
    const angle = Math.atan2(dy, dx);
    const offset = 10;
    const offX = -Math.sin(angle) * offset;
    const offY = Math.cos(angle) * offset;
    label.position.set(midX + offX, midY + offY);
    label.__scene.attrs.x = midX + offX;
    label.__scene.attrs.y = midY + offY;
    // position and rotate arrow at end, pointing along the line
    arrow.position.set(relativePos.x, relativePos.y);
    arrow.__scene.attrs.x = relativePos.x;
    arrow.__scene.attrs.y = relativePos.y;
    arrow.__scene.attrs.rotation = (angle * 180) / Math.PI + 90;
    arrow.rotation = degreesToRadians((angle * 180) / Math.PI + 90);
    stage.batchDraw();
  };

  const onMouseUp = (_e: ScenePointerEvent) => {};

  const handlerDisposer = () => {
    if (measuringState) {
      const { line, arrow, label } = measuringState;
      line.destroy();
      arrow.destroy();
      label.destroy();
      measuringState = null;
      stage.batchDraw();
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
export default getMeasureHandlers;
