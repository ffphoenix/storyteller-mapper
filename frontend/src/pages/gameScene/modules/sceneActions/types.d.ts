import Konva from "konva";

export type ActionProducer = "self" | "history" | "websocket";

export type ModifyActionType = "transformend" | "dragend" | undefined;

export type SceneActionEvent = {
  producer: ActionProducer;
  layerId: string;
  nodes: Konva.Node | Konva.Node[];
  transformer?: Konva.Transformer;
  event?: MouseEvent;
  actionType?: ModifyActionType;
  originalProps?: Partial<Konva.NodeConfig>;
};
export type SceneHistoryActionEvent = {
  action: string;
  nodes: Partial<Konva.Node>[];
  layerId: string;
  actionType?: string;
  originalGroupProps?: Partial<Konva.NodeConfig>;
  currentGroupProps?: Partial<Konva.NodeConfig>;
};
