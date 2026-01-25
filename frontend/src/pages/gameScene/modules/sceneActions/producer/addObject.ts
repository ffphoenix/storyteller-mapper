import Konva from "konva";

const addObject = (stage: Konva.Stage, nodes: Partial<Konva.Node>[], layerId: string) => {
  const layer = stage.findOne(`#${layerId}`) as Konva.Layer;
  if (!layer) {
    console.error(`Layer with id ${layerId} not found in stage`);
    return;
  }
  nodes.forEach((nodeJSON) => {
    const node = Konva.Node.create(nodeJSON);
    layer.add(node);
  });
  stage.batchDraw();
};

export default addObject;
