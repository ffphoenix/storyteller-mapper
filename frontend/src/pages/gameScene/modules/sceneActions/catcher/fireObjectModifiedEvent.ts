import type { ActionProducer, ModifyActionType, SceneActionEvent } from "../types";
import type { SceneTransformer } from "../../sceneTransformer/SceneTransformer";
import type { TransformProps } from "../../sceneTransformer/types";
import SceneStore from "../../../store/SceneStore";

const fireObjectModifiedEvent = (
  producer: ActionProducer,
  actionType: ModifyActionType,
  nodes: SceneTransformer,
  transformer: SceneTransformer,
  originalProps: TransformProps,
  event?: MouseEvent,
) => {
  if (producer !== "self") return;
  document.dispatchEvent(
    new CustomEvent<SceneActionEvent>("sc:object:modified", {
      detail: {
        producer,
        nodes,
        event,
        actionType,
        originalProps,
        transformer,
        layerId: nodes.__scene.layerId || SceneStore.activeLayerId,
      },
    }),
  );
};
export default fireObjectModifiedEvent;
