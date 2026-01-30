import setTransformerEvents from "./setTransformerEvents";
import type { PixiStage } from "../sceneStage/pixiStage";
import { SceneTransformer } from "./SceneTransformer";

const getTransformer = (stage: PixiStage): SceneTransformer => {
  let transformer = stage.findOne("Transformer") as SceneTransformer | null;

  if (!transformer) {
    transformer = new SceneTransformer(stage);
    transformer.__scene.layerId = stage.getLayers()[0]?.__scene.id ?? "";
    stage.overlay.addChild(transformer);
    setTransformerEvents(transformer);
  }
  return transformer;
};
export default getTransformer;
