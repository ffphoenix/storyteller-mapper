import type { PixiStage } from "../../sceneStage/pixiStage";

const drawActiveLayer = (stage: PixiStage) => {
  stage.batchDraw();
};
export default drawActiveLayer;
