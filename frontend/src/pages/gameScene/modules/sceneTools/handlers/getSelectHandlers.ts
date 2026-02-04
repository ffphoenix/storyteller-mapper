import type { MouseHandlers } from "../useSceneTools";
import getActiveLayer from "../utils/getActiveLayer";
import drawActiveLayer from "../utils/drawActiveLayer";
import { onMouseUpSelectByClick } from "./select/onMouseUpSelectByClick";
import { onMouseUpSelectByArea } from "./select/onMouseUpSelectByArea";
import getTransformer from "../../sceneTransformer/getTransformer";
import clearTransformerNodesSelection from "../../sceneTransformer/clearTransformerNodesSelection";
import isKeyDownInterceptable from "../../../utils/isKeyDownInterceptable";
import { handleDeleteSelected } from "./select/handleDeleteSelected";
import { handleCopySelected } from "./select/handleCopySelected";
import { handlePasteSelected } from "./select/handlePasteSelected";
import type { PixiStage, ScenePointerEvent } from "../../sceneStage/pixiStage";
import { createNodeFromJSON, updateNodeGeometry } from "../../../utils/nodes/createNodeFromJSON";
import type { SceneNode } from "../../../utils/nodes/types";

const getSelectHandlers = (stage: PixiStage): MouseHandlers => {
  const activeLayer = getActiveLayer(stage);
  const transformer = getTransformer(stage);
  if (activeLayer) {
    transformer.moveTo(stage.overlay);
    transformer.__scene.layerId = activeLayer.__scene.id;
    transformer.moveToTop();
    drawActiveLayer(stage);
  }

  let selectionRectangle = stage.findOne("#selection-rectangle") as SceneNode | null;
  if (!selectionRectangle) {
    selectionRectangle = createNodeFromJSON({
      className: "Rect",
      attrs: {
        id: "selection-rectangle",
        name: "selection-rectangle",
        fill: "rgba(88,167,252,0.3)",
        width: 1,
        height: 1,
      },
    });
    selectionRectangle.visible = false;
    selectionRectangle.eventMode = "none";
    stage.overlay.addChild(selectionRectangle);
  }
  let isSelectingByClick = false;
  let isSelectingByArea = false;
  let startPosition: { x: number; y: number } | null = null;

  const onMouseDown = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) {
      return;
    }
    const pos = stage.getWorldPointerPosition();
    if (!pos) return;
    startPosition = pos;

    isSelectingByClick = true;
  };

  const onMouseMoveWindow = () => {
    if (!startPosition) return;
    const currentPosition = stage.getWorldPointerPosition();
    if (!currentPosition) return;
    const dx = Math.abs(currentPosition.x - startPosition.x);
    const dy = Math.abs(currentPosition.y - startPosition.y);
    if (dx > 5 || dy > 5) {
      isSelectingByClick = false;
      isSelectingByArea = true;
      selectionRectangle.visible = true;
      const x = Math.min(startPosition.x, currentPosition.x);
      const y = Math.min(startPosition.y, currentPosition.y);
      selectionRectangle.position.set(x, y);
      selectionRectangle.__scene.attrs.x = x;
      selectionRectangle.__scene.attrs.y = y;
      selectionRectangle.__scene.attrs.width = dx;
      selectionRectangle.__scene.attrs.height = dy;
      updateNodeGeometry(selectionRectangle);
      stage.batchDraw();
    }
  };

  const onMouseUp = (e: ScenePointerEvent) => {
    if (e.evt.button !== 0) return;

    if (isSelectingByClick) {
      onMouseUpSelectByClick(stage, e, transformer);
      isSelectingByArea = false;
      isSelectingByClick = false;
      startPosition = null;
    }
  };

  const onMouseUpWindow = (e: MouseEvent) => {
    if (e.button !== 0) return;

    if (isSelectingByArea) {
      onMouseUpSelectByArea(stage, transformer, selectionRectangle);
    }
    isSelectingByArea = false;
    isSelectingByClick = false;
    startPosition = null;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!isKeyDownInterceptable(e)) return;
    if (e.code === "Delete" || e.code === "Backslash") {
      handleDeleteSelected(stage);
      e.preventDefault();
      return;
    }

    if (e.code === "Escape") {
      clearTransformerNodesSelection(stage);
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    if (isCtrlOrMeta && e.code === "KeyC") {
      handleCopySelected(stage);
      e.preventDefault();
    }
    if (isCtrlOrMeta && e.code === "KeyV") {
      handlePasteSelected(stage);
      e.preventDefault();
    }
  };

  document.addEventListener("keydown", onKeyDown);

  // TODO: research how to handle mousemove outside of window
  document.addEventListener("mousemove", onMouseMoveWindow);
  document.addEventListener("mouseup", onMouseUpWindow);

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove: (_e: ScenePointerEvent) => {},
    handlerDisposer: () => {
      clearTransformerNodesSelection(stage);
      transformer.destroy();
      selectionRectangle?.destroy();
      stage.batchDraw();
      document.removeEventListener("mousemove", onMouseMoveWindow);
      document.removeEventListener("mouseup", onMouseUpWindow);
      document.removeEventListener("keydown", onKeyDown);
    },
  };
};

export default getSelectHandlers;
