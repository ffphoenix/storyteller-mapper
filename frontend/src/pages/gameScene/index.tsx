import React from "react";
import ToolMenu from "./modules/sceneTools/components/ToolMenu";
import "./style.css";
import useStage from "./modules/sceneStage/useStage";
import ZoomControls from "./modules/sceneZoomControls/components/ZoomControls";
import useWheelZoomHandler from "./modules/sceneZoomControls/useWheelZoomHandler";
import useSceneTools from "./modules/sceneTools/useSceneTools";
import useSceneHistory from "./modules/sceneHistory/useSceneHistory";
import SceneContextMenu from "./modules/sceneTools/components/SceneContextMenu";
import sceneStore from "./store/SceneStore";

const GameScenePage: React.FC = () => {
  const { stageRef, containerRef } = useStage();
  useWheelZoomHandler(stageRef);
  useSceneTools(stageRef);
  useSceneHistory(stageRef);
  console.log("GameScenePage rendered");
  if (!sceneStore.activeSceneId) return null;

  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-0 h-full p-1 border-r bg-white/90 backdrop-blur-sm z-1000">
        <ToolMenu stageRef={stageRef} />
      </div>

      <div className="w-full h-full border rounded bg-white overflow-hidden relative" ref={containerRef}></div>
      <ZoomControls stageRef={stageRef} />
      <SceneContextMenu />
    </div>
  );
};

export default GameScenePage;
