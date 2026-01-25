import Konva from "konva";
import setTransformerEvents from "./setTransformerEvents";

const getTransformer = (stage: Konva.Stage): Konva.Transformer => {
  let transformer = stage.findOne("Transformer") as Konva.Transformer;

  if (!transformer) {
    transformer = new Konva.Transformer({
      name: "Transformer",
      draggable: true,
      shouldOverdrawWholeArea: true,
    });
    setTransformerEvents(transformer);
  }
  return transformer;
};
export default getTransformer;
