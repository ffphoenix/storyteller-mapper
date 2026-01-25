import type Konva from "konva";
import type { ActionProducer, SceneActionEvent } from "../types";

const fireObjectRemovedEvent = (
  producer: ActionProducer,
  nodes: Konva.Node | Konva.Node[],
  layerId: string,
  event?: Konva.KonvaEventObject<MouseEvent>,
) => {
  document.dispatchEvent(
    new CustomEvent<SceneActionEvent>("sc:object:removed", { detail: { producer, nodes, event: event?.evt, layerId } }),
  );
};
export default fireObjectRemovedEvent;
