import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import type { MouseHandlers } from "../useSceneTools";

const getMeasureHandlers = (stage: Stage): MouseHandlers => {
  stage.container().style.cursor = "crosshair";
  let measuringState: {
    start: Konva.Vector2d;
    line: Konva.Line;
    arrow: Konva.RegularPolygon;
    label: Konva.Text;
  } | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    if (!measuringState) {
      // start
      const red = "#ef4444"; // tailwind red-500
      const line = new Konva.Line({
        points: [relativePos.x, relativePos.y, relativePos.x, relativePos.y],
        stroke: red,
        strokeWidth: 2,
        listening: false,
      });
      const arrow = new Konva.RegularPolygon({
        x: relativePos.x,
        y: relativePos.y,
        sides: 3,
        radius: 6,
        fill: red,
        listening: false,
      });
      const label = new Konva.Text({
        x: relativePos.x,
        y: relativePos.y,
        text: "0 px",
        fontSize: 14,
        fill: red,
        background: "rgba(255,255,255,0.6)",
        listening: false,
      });
      const layer = stage.getLayers()[0];
      layer.add(line);
      layer.add(arrow);
      layer.add(label);
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

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!measuringState) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy().invert();
    const relativePos = transform.point(pos);

    const { start, line, arrow, label } = measuringState;
    // update line end
    line.points([start.x, start.y, relativePos.x, relativePos.y]);
    // compute distance
    const dx = relativePos.x - start.x;
    const dy = relativePos.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    label.text(`${Math.round(dist)} px`);
    // position label at midpoint with slight offset perpendicular to line
    const midX = (start.x + relativePos.x) / 2;
    const midY = (start.y + relativePos.y) / 2;
    const angle = Math.atan2(dy, dx);
    const offset = 10;
    const offX = -Math.sin(angle) * offset;
    const offY = Math.cos(angle) * offset;
    label.position({ x: midX + offX, y: midY + offY });
    // position and rotate arrow at end, pointing along the line
    arrow.position({ x: relativePos.x, y: relativePos.y });
    arrow.rotation((angle * 180) / Math.PI + 90);
    stage.batchDraw();
  };

  const onMouseUp = () => {};

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
