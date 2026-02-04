import type { SceneNodeJSON, SceneNode } from "./types";

type StageLookup = {
  findOne: (selector: string) => SceneNode | null;
};

const getNodesByJSON = (stage: StageLookup, nodesJSON: SceneNodeJSON[]): SceneNode[] => {
  return nodesJSON.reduce((acc, nodeJSON) => {
    const node = stage.findOne(`#${nodeJSON.attrs?.id}`);
    if (node) acc.push(node);
    return acc;
  }, [] as SceneNode[]);
};
export default getNodesByJSON;
