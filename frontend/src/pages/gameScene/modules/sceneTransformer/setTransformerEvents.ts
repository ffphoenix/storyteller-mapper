import Konva from "konva";
import fireObjectModifiedEvent from "../sceneActions/catcher/fireObjectModifiedEvent";
import sceneTransformerStore from "./store/SceneTransformerStore";
import type { ModifyActionType } from "../sceneActions/types";
import getNodeTransformProps from "./getNodeTransformProps";
import { toJS } from "mobx";

const setTransformerEvents = (transformer: Konva.Transformer) => {
  transformer.on("transformend dragend", (e) => {
    const nodes = e.target as Konva.Shape;
    const transformerNode = e.currentTarget as Konva.Transformer;

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
