import type { Stage } from "konva/lib/Stage";
import type { MutableRefObject } from "react";

export default (stage: MutableRefObject<Stage | null>, containerRef: MutableRefObject<HTMLElement | null>) => {
  if (!containerRef.current || !stage.current) return;
  const headerHeight = 69;
  const canvasHeight = window.innerHeight - headerHeight;
  const canvasWidth = window.innerWidth;
  console.log("handleCanvasResize", canvasWidth, window.innerHeight - 68);
  stage.current.width(canvasWidth);
  stage.current.height(canvasHeight);
};
