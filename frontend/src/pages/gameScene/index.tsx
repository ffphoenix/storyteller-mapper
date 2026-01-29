import React, { useRef } from "react";
import ToolMenu from "./modules/sceneTools/components/ToolMenu";
import "./style.css";
import useStage from "./modules/sceneStage/useStage";
import ZoomControls from "./modules/sceneZoomControls/components/ZoomControls";
import useWheelZoomHandler from "./modules/sceneZoomControls/useWheelZoomHandler";
import useSceneTools from "./modules/sceneTools/useSceneTools";
import useSceneHistory from "./modules/sceneHistory/useSceneHistory";
import SceneContextMenu from "./modules/sceneTools/components/SceneContextMenu";

const GameScenePage: React.FC = () => {
  const parentContainerRef = useRef<HTMLDivElement | null>(null);
  const { stageRef, containerRef } = useStage(parentContainerRef);
  useWheelZoomHandler(stageRef);
  useSceneTools(stageRef);
  useSceneHistory(stageRef);
  console.log("GameScenePage rendered");

  return (
    <div className="relative w-full h-full flex-1 min-h-full" ref={parentContainerRef}>
      <div className="absolute left-0 top-0 h-full pl-1 pr-1 border-r bg-white/90 backdrop-blur-sm z-1000">
        <ToolMenu stageRef={stageRef} />
      </div>

      <div className="w-full h-full min-h-0 rounded bg-white overflow-hidden relative" ref={containerRef}></div>
      <ZoomControls stageRef={stageRef} />
      <SceneContextMenu />
    </div>
  );
};

export default GameScenePage;
