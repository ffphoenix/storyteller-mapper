import type { Stage } from "konva/lib/Stage";
import type { MutableRefObject } from "react";

export default (stage: MutableRefObject<Stage | null>, containerRef: MutableRefObject<HTMLElement | null>) => {
  if (!containerRef.current || !stage.current) return;
  const { clientWidth, clientHeight } = containerRef.current;
  const height = Math.max(clientHeight, window.innerHeight);
  const width = Math.max(clientWidth, 800);
  console.log("handleCanvasResize", width, height);
  stage.current.width(width);
  stage.current.height(height - 220);
};
