import fireObjectModifiedEvent from "../sceneActions/catcher/fireObjectModifiedEvent";
import sceneTransformerStore from "./store/SceneTransformerStore";
import type { ModifyActionType } from "../sceneActions/types";
import getNodeTransformProps from "./getNodeTransformProps";
import { toJS } from "mobx";
import type { SceneTransformer } from "./SceneTransformer";

const setTransformerEvents = (transformer: SceneTransformer) => {
  transformer.on("transformend dragend", (e) => {
    const nodes = e.target as SceneTransformer;
    const transformerNode = e.currentTarget as SceneTransformer;

    fireObjectModifiedEvent(
      "self",
      e.type as ModifyActionType,
      nodes,
      transformerNode,
      toJS(sceneTransformerStore.startProps),
      e.evt,
    );
    sceneTransformerStore.setStartProps(getNodeTransformProps(nodes));
  });
};
export default setTransformerEvents;
