import Konva from "konva";

const getNodesByJSON = (stage: Konva.Stage, nodesJSON: Partial<Konva.Node>[]): Konva.Node[] => {
  return nodesJSON.reduce((acc, nodeJSON) => {
    const node = stage.findOne(`#${nodeJSON.attrs?.id}`);
    if (node) acc.push(node);
    return acc;
  }, [] as Konva.Node[]);
};
export default getNodesByJSON;
