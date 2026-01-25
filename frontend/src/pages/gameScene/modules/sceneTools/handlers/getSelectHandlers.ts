import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
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

const getSelectHandlers = (stage: Stage): MouseHandlers => {
  const activeLayer = getActiveLayer(stage);
  const transformer = getTransformer(stage);
  if (activeLayer) {
    transformer.moveTo(activeLayer);
    transformer.moveToTop();
    drawActiveLayer(stage);
  }

  let selectionRectangle = stage.findOne("#selection-rectangle") as Konva.Rect;
  if (!selectionRectangle) {
    selectionRectangle = new Konva.Rect({
      fill: "rgba(88,167,252,0.3)",
      visible: false,
      id: "selection-rectangle",
    });
    activeLayer.add(selectionRectangle);
  }
  let isSelectingByClick = false;
  let isSelectingByArea = false;
  let startPosition: Konva.Vector2d | null = null;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const node = e.target as Konva.Node;
    if (e.evt.button !== 0 || node.getParent() === transformer || node === transformer) {
      return;
    }

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    startPosition = transform.point(pos);

    isSelectingByClick = true;
  };

  const onMouseMoveWindow = () => {
    if (!startPosition) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const currentPosition = transform.point(pos);
    const dx = Math.abs(currentPosition.x - startPosition.x);
    const dy = Math.abs(currentPosition.y - startPosition.y);
    if (dx > 5 || dy > 5) {
      isSelectingByClick = false;
      isSelectingByArea = true;
      selectionRectangle.visible(true);
      selectionRectangle.width(dx);
      selectionRectangle.height(dy);
      selectionRectangle.x(Math.min(startPosition.x, currentPosition.x));
      selectionRectangle.y(Math.min(startPosition.y, currentPosition.y));
      stage.batchDraw();
    }
  };

  const onMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
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
    if (!isKeyDownInterceptable(e, stage)) return;
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
    onMouseMove: () => {},
    handlerDisposer: () => {
      clearTransformerNodesSelection(stage);
      transformer.destroy();
      selectionRectangle.destroy();
      stage.batchDraw();
      document.removeEventListener("mousemove", onMouseMoveWindow);
      document.removeEventListener("mouseup", onMouseUpWindow);
      document.removeEventListener("keydown", onKeyDown);
    },
  };
};

export default getSelectHandlers;
