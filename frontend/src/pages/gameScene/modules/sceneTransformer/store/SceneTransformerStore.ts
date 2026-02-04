import { makeAutoObservable } from "mobx";
import type { TransformProps } from "../types";

type SceneTransformerStore = {
  startProps: TransformProps;
  setStartProps: (props: TransformProps) => void;
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
