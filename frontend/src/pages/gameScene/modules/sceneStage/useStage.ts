import { useEffect, useRef, useState } from "react";
import handleCanvasResize from "./handleCanvasResize";
import { createGrid } from "./createGrid";
import sceneStore from "../../store/SceneStore";
import { reaction, toJS } from "mobx";
import { createPixiStage, type PixiStage } from "./pixiStage";
import { Container, type TilingSprite } from "pixi.js";
import type { SceneLayer } from "../../utils/nodes/types";

const initStage = async (container: HTMLDivElement) => {
  const stageJSON = toJS(sceneStore.stageJSON);
  if (!stageJSON) throw new Error("Stage JSON is not loaded");

  const stage = await createPixiStage(container, stageJSON);
  const gridLayer = new Container() as SceneLayer;
  gridLayer.__scene = { id: "grid-layer", className: "Layer" };
  const grid = createGrid(50 * 70, 50 * 70);
  gridLayer.addChild(grid);
  stage.world.addChildAt(gridLayer, 0);
  stage.layers.set(gridLayer.__scene.id, gridLayer);
  return { stage, grid };
};

const useStage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<PixiStage | null>(null);
  const gridRef = useRef<TilingSprite | null>(null);
  const [stageVersion, setStageVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current) return;

    const setupStage = async () => {
      const { stage, grid } = await initStage(containerRef.current as HTMLDivElement);
      if (!isMounted) {
        stage.destroy();
        return undefined;
      }

      stageRef.current = stage;
      gridRef.current = grid;
      setStageVersion((version) => version + 1);

      handleCanvasResize(stageRef, containerRef, gridRef);
      const eventResizeHandler = () => handleCanvasResize(stageRef, containerRef, gridRef);
      window.addEventListener("resize", eventResizeHandler);

      const onContextMenu = (e: MouseEvent) => e.preventDefault();
      stage.view.addEventListener("contextmenu", onContextMenu);

      const disposeReaction = reaction(
        () => sceneStore.activeSceneId,
        async () => {
          stage.destroy();
          if (!containerRef.current) return;
          const result = await initStage(containerRef.current);
          if (!isMounted) {
            result.stage.destroy();
            return;
          }
          stageRef.current = result.stage;
          gridRef.current = result.grid;
          setStageVersion((version) => version + 1);
          handleCanvasResize(stageRef, containerRef, gridRef);
        },
      );

      return () => {
        window.removeEventListener("resize", eventResizeHandler);
        stage.view.removeEventListener("contextmenu", onContextMenu);
        disposeReaction();
        stage.destroy();
        stageRef.current = null;
        gridRef.current = null;
      };
    };

    let cleanup: (() => void) | undefined;
    setupStage().then((dispose) => {
      cleanup = dispose;
    });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, []);

  return {
    containerRef,
    stageRef,
    stageVersion,
  };
};
export default useStage;
