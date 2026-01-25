import type { Stage } from "konva/lib/Stage";
import SceneStore from "../../../store/SceneStore";
import Konva from "konva";

const drawActiveLayer = (stage: Stage) => {
  const layer = stage.findOne(`#${SceneStore.activeLayerId}`) as Konva.Layer;
  if (!layer) throw new Error(`Layer #ID ${SceneStore.activeLayerId} not found`);
  layer.batchDraw();
};
export default drawActiveLayer;
