import { makeAutoObservable } from "mobx";
import Konva from "konva";

type ToolsStore = {
  select: {
    clipboardNodes: Partial<Konva.Node>[];
  };
  setClipboardNodes: (nodes: Partial<Konva.Node>[]) => void;
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
