import { type MutableRefObject } from "react";
import Konva from "konva";
import SceneStore from "../../../store/SceneStore";
import { observer } from "mobx-react-lite";
import { MAX_ZOOM, MIN_ZOOM } from "../../../constants/uiConstants";
import gameHistoryMessages from "../../../../gameMessagesHistory/store/GameHistoryMessages";

const zoomByFactor = (stageRef: MutableRefObject<Konva.Stage | null>, factor: number) => {
  if (!stageRef.current) return;
  const stage = stageRef.current;
  const oldZoom = stage.scaleX();
  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * factor));

  const center = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };

  const mousePointTo = {
    x: (center.x - stage.x()) / oldZoom,
    y: (center.y - stage.y()) / oldZoom,
  };

  stage.scale({ x: newZoom, y: newZoom });

  const newPos = {
    x: center.x - mousePointTo.x * newZoom,
    y: center.y - mousePointTo.y * newZoom,
  };
  stage.position(newPos);
  stage.batchDraw();

  SceneStore.setCurrentZoom(newZoom);
};

type ZoomControlsProps = {
  stageRef: MutableRefObject<Konva.Stage | null>;
};
export default observer(({ stageRef }: ZoomControlsProps) => {
  const handleZoomIn = () => zoomByFactor(stageRef, 1.2);
  const handleZoomOut = () => zoomByFactor(stageRef, 1 / 1.2);
  const zoomClasses =
    "absolute right-3 top-3 flex flex-col gap-2 z-50" +
    (gameHistoryMessages.isOpen ? " right-[325px]" : " right-[50px]");
  return (
    <div className={zoomClasses}>
      <span className="text-sm text-gray-500">{SceneStore.currentZoom}%</span>
      <button
        type="button"
        onClick={handleZoomIn}
        className="w-9 h-9 rounded-md border bg-white/90 hover:bg-white text-gray-800 shadow"
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        className="w-9 h-9 rounded-md border bg-white/90 hover:bg-white text-gray-800 shadow"
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
    </div>
  );
});
