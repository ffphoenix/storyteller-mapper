import SceneStore from "../../../store/SceneStore";
import type { PixiStage } from "../../sceneStage/pixiStage";

const getActiveLayer = (stage: PixiStage) => {
  const layer = stage.getLayerById(SceneStore.activeLayerId);
  if (!layer) throw new Error(`Layer #ID ${SceneStore.activeLayerId} not found`);
  return layer;
};
export default getActiveLayer;
