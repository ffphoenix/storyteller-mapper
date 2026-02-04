import type { MutableRefObject } from "react";
import type { PixiStage } from "./pixiStage";
import type { TilingSprite } from "pixi.js";
import { Rectangle } from "pixi.js";

export default (
  stage: MutableRefObject<PixiStage | null>,
  containerRef: MutableRefObject<HTMLElement | null>,
  gridRef?: MutableRefObject<TilingSprite | null>,
) => {
  if (!containerRef.current || !stage.current) return;
  const { clientWidth, clientHeight } = containerRef.current;
  const height = Math.max(clientHeight, 0);
  const width = Math.max(clientWidth, 0);
  stage.current.app.renderer.resize(width, height);
  stage.current.app.stage.hitArea = new Rectangle(0, 0, width, height);
  if (gridRef?.current) {
    gridRef.current.width = width;
    gridRef.current.height = height;
  }
  stage.current.batchDraw();
};
