import Konva from "konva";

const getNodesLayerId = (nodes: Konva.Node | Konva.Node[]) => {
  const node = Array.isArray(nodes) ? nodes[0] : nodes;
  const nodeLayer = node.getLayer() as Konva.Layer;
  if (!nodeLayer) throw new Error("Object must be attached to a layer");
  return nodeLayer.id();
};
export default getNodesLayerId;
