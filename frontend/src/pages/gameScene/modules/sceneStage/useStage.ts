import { useEffect, useRef } from "react";
import Konva from "konva";
import handleCanvasResize from "./handleCanvasResize";
import createGrid from "./createGrid";
import sceneStore from "../../store/SceneStore";
import { reaction, toJS } from "mobx";

const initStage = (container: HTMLDivElement) => {
  const stageJSON = toJS(sceneStore.stageJSON);
  if (!stageJSON) throw new Error("Stage JSON is not loaded");

  const { width, height } = container.getBoundingClientRect();
  const stage = Konva.Node.create(stageJSON, container);
  stage.width(width);
  stage.height(height);
  const gridLayer = new Konva.Layer({
    id: "grid-layer",
    listening: false,
  });

  stage.add(gridLayer);
  createGrid(gridLayer);
  return stage;
};

const useStage = (parentContainerRef: useRef<HTMLDivElement | null>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const stage = initStage(containerRef.current);

    const disposeReaction = reaction(
      () => sceneStore.activeSceneId,
      () => {
        if (stage) {
          stage.destroy();
        }
        if (!containerRef.current) return;
        stageRef.current = initStage(containerRef.current);
      },
    );

    stageRef.current = stage;

    handleCanvasResize(stageRef, containerRef);
    const eventResizeHandler = () => handleCanvasResize(stageRef, containerRef);
    window.addEventListener("resize", eventResizeHandler);

    stage.on("contextmenu", (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
    });

    return () => {
      window.removeEventListener("resize", eventResizeHandler);
      disposeReaction();
      stage.destroy();
      stageRef.current = null;
    };
  }, [parentContainerRef]);

  return {
    containerRef,
    stageRef,
  };
};
export default useStage;
