import { makeAutoObservable } from "mobx";
import type { SceneNodeJSON } from "../../../utils/nodes/types";

type ToolsStore = {
  select: {
    clipboardNodes: SceneNodeJSON[];
  };
  setClipboardNodes: (nodes: SceneNodeJSON[]) => void;
};
const toolsStore = makeAutoObservable<ToolsStore>({
  select: {
    clipboardNodes: [],
  },
  setClipboardNodes: (nodes) => {
    toolsStore.select.clipboardNodes = nodes;
  },
});

export default toolsStore;
