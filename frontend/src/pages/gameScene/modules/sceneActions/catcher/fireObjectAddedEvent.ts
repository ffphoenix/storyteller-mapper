import type { ActionProducer, SceneActionEvent } from "../types";
import getNodesLayerId from "../../../utils/nodes/getNodesLayerId";
import type { SceneNode } from "../../../utils/nodes/types";

const fireObjectAddedEvent = (producer: ActionProducer, nodes: SceneNode | SceneNode[]) => {
  const layerId = getNodesLayerId(nodes);

  document.dispatchEvent(
    new CustomEvent<SceneActionEvent>("sc:object:added", { detail: { producer, nodes, layerId } }),
  );
};
export default fireObjectAddedEvent;
