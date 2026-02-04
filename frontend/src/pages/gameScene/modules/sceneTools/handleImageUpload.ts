import getActiveLayer from "./utils/getActiveLayer";
import fireObjectAddedEvent from "../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../utils/uuid";
import type { PixiStage } from "../sceneStage/pixiStage";
import { createNodeFromJSON } from "../../utils/nodes/createNodeFromJSON";

const handleImageUpload = (stage: PixiStage, file: File) => {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    const imgObject = new Image();
    imgObject.src = dataUrl;
    imgObject.onload = () => {
      const imageWidth = imgObject.width;
      const imageHeight = imgObject.height;

      const sw = stage.width();
      const sh = stage.height();
      const padding = 20;
      const maxW = Math.max(10, sw - padding * 2);
      const maxH = Math.max(10, sh - padding * 2);

      const scale = Math.min(maxW / imageWidth, maxH / imageHeight, 1);

      const layer = getActiveLayer(stage);
      const imageNode = createNodeFromJSON({
        className: "Image",
        attrs: {
          id: generateUUID(),
          name: "object image",
          src: dataUrl,
          x: sw / 2,
          y: sh / 2,
          scaleX: scale,
          scaleY: scale,
          offsetX: imageWidth / 2,
          offsetY: imageHeight / 2,
          draggable: false,
        },
      });
      imageNode.__scene.layerId = layer.__scene.id;
      if (layer) {
        layer.addChild(imageNode);
        stage.batchDraw();
        fireObjectAddedEvent("self", imageNode);
      }
    };
  };
  reader.onerror = () => {
    console.warn("Failed to read image file");
  };
  reader.readAsDataURL(file);
};
export default handleImageUpload;
