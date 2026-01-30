import type { SceneNode, SceneNodeJSON } from "../../utils/nodes/types";
import type { SceneTransformer } from "../sceneTransformer/SceneTransformer";
import type { TransformProps } from "../sceneTransformer/types";

export type ActionProducer = "self" | "history" | "websocket";

export type ModifyActionType = "transformend" | "dragend" | undefined;

export type SceneActionEvent = {
  producer: ActionProducer;
  layerId: string;
  nodes: SceneNode | SceneNode[] | SceneTransformer;
  transformer?: SceneTransformer;
  event?: MouseEvent;
  actionType?: ModifyActionType;
  originalProps?: TransformProps;
};
export type SceneHistoryActionEvent = {
  action: string;
  nodes: SceneNodeJSON[];
  layerId: string;
  actionType?: string;
  originalGroupProps?: TransformProps;
  currentGroupProps?: TransformProps;
};
