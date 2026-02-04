import type { Container } from "pixi.js";
import type { SceneNode } from "./types";

const getLayerIdFromParent = (parent: Container | null) => {
  let current: Container | null = parent;
  while (current) {
    const sceneMeta = (current as unknown as { __scene?: { className?: string; id?: string } }).__scene;
    if (sceneMeta?.className === "Layer" && sceneMeta.id) {
      return sceneMeta.id;
    }
    current = current.parent as Container | null;
  }
  return null;
};

const getNodesLayerId = (nodes: SceneNode | SceneNode[]) => {
  const node = Array.isArray(nodes) ? nodes[0] : nodes;
  const layerId = getLayerIdFromParent(node.parent as Container | null);
  if (!layerId) throw new Error("Object must be attached to a layer");
  return layerId;
};
export default getNodesLayerId;
