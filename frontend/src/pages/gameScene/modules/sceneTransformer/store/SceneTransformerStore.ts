import { makeAutoObservable } from "mobx";
import Konva from "konva";

type SceneTransformerStore = {
  startProps: Partial<Konva.NodeConfig>;
  setStartProps: (props: Partial<Konva.NodeConfig>) => void;
};

const sceneTransformerStore = makeAutoObservable<SceneTransformerStore>({
  startProps: {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    width: 0,
    height: 0,
  },
  setStartProps: (props) => {
    sceneTransformerStore.startProps = { ...sceneTransformerStore.startProps, ...props };
  },
});

export default sceneTransformerStore;
