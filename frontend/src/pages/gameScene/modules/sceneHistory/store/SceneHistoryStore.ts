import { makeAutoObservable } from "mobx";
import type { ModifyActionType } from "../../sceneActions/types";
import type { SceneNodeJSON } from "../../../utils/nodes/types";
import type { TransformProps } from "../../sceneTransformer/types";

type Action = "add" | "modify" | "remove";
type EventItem = {
  layerId: string;
  nodes: SceneNodeJSON[];
  originalGroupProps?: TransformProps;
  currentGroupProps?: TransformProps;
  actionType?: ModifyActionType;
};
export type HistoryItem = {
  action: Action;
  layerId: string;
  nodes: SceneNodeJSON[];
  originalGroupProps?: TransformProps;
  currentGroupProps?: TransformProps;
  actionType?: ModifyActionType;
};
type SceneHistory = {
  maxHistoryLength: number;
  undoHistory: HistoryItem[];
  redoHistory: HistoryItem[];
  addUndoHistoryItem: (action: Action, eventItem: EventItem, isRedoAction?: boolean) => void;
  addRedoHistoryItem: (action: Action, eventItem: EventItem) => void;
  latestUndoHistoryItem: HistoryItem | undefined;
  latestRedoHistoryItem: HistoryItem | undefined;
  popUndoHistoryItem: () => HistoryItem | undefined;
  popRedoHistoryItem: () => HistoryItem | undefined;
};

const sceneHistoryStore = makeAutoObservable<SceneHistory>({
  maxHistoryLength: 50,
  undoHistory: [],
  redoHistory: [],
  addUndoHistoryItem: (action, eventItem: EventItem, isRedoAction = false) => {
    sceneHistoryStore.undoHistory.push({ ...eventItem, action });

    if (sceneHistoryStore.undoHistory.length > sceneHistoryStore.maxHistoryLength) {
      sceneHistoryStore.undoHistory.shift();
    }
    if (!isRedoAction) {
      sceneHistoryStore.redoHistory = [];
    }
  },
  addRedoHistoryItem: (action, eventItem) => {
    sceneHistoryStore.redoHistory.push({ ...eventItem, action });

    if (sceneHistoryStore.redoHistory.length > sceneHistoryStore.maxHistoryLength) {
      sceneHistoryStore.redoHistory.shift();
    }
  },
  get latestUndoHistoryItem(): HistoryItem | undefined {
    return sceneHistoryStore.undoHistory[sceneHistoryStore.undoHistory.length - 1];
  },
  get latestRedoHistoryItem(): HistoryItem | undefined {
    return sceneHistoryStore.redoHistory[sceneHistoryStore.redoHistory.length - 1];
  },
  popUndoHistoryItem: (): HistoryItem | undefined => {
    return sceneHistoryStore.undoHistory.pop();
  },
  popRedoHistoryItem: (): HistoryItem | undefined => {
    return sceneHistoryStore.redoHistory.pop();
  },
});

export default sceneHistoryStore;
