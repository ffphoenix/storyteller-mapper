import type { SceneHistoryActionEvent } from "../types";
import nodesToJSON from "../../../utils/nodes/nodesToJSON";
import getNodesByJSON from "../../../utils/nodes/getNodesByJSON";
import Konva from "konva";

const fireObjectHistoryAction = (
  stage: Konva.Stage,
  { ...props }: SceneHistoryActionEvent & { historyAction: "undo" | "redo" },
) => {
  const action =
    props.historyAction === "redo"
      ? props.action
      : props.action === "modify"
        ? props.action
        : props.action === "add"
          ? "remove"
          : "add";
  const nodes = action !== "modify" ? props.nodes : nodesToJSON(getNodesByJSON(stage, props.nodes));
  document.dispatchEvent(
    new CustomEvent<SceneHistoryActionEvent>("sc:object:history:action", { detail: { ...props, action, nodes } }),
  );
};
export default fireObjectHistoryAction;
