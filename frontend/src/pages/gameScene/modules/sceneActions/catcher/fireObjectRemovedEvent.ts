import type { ActionProducer, SceneActionEvent } from "../types";
import type { SceneNode } from "../../../utils/nodes/types";

const fireObjectRemovedEvent = (
  producer: ActionProducer,
  nodes: SceneNode | SceneNode[],
  layerId: string,
  event?: { evt: MouseEvent },
) => {
  document.dispatchEvent(
    new CustomEvent<SceneActionEvent>("sc:object:removed", { detail: { producer, nodes, event: event?.evt, layerId } }),
  );
};
export default fireObjectRemovedEvent;
