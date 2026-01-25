import Konva from "konva";
import getActiveLayer from "./utils/getActiveLayer";
import fireObjectAddedEvent from "../sceneActions/catcher/fireObjectAddedEvent";
import { generateUUID } from "../../utils/uuid";

const handleImageUpload = (stage: Konva.Stage, file: File) => {
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

      const konvaImage = new Konva.Image({
        id: generateUUID(),
        name: "object image",
        image: imgObject,
        x: sw / 2,
        y: sh / 2,
        scaleX: scale,
        scaleY: scale,
        draggable: false,
      });

      // Center the image (offset by half its scaled size)
      konvaImage.offsetX(imageWidth / 2);
      konvaImage.offsetY(imageHeight / 2);

      const layer = getActiveLayer(stage);
      if (layer) {
        layer.add(konvaImage);
        layer.draw();
        fireObjectAddedEvent("self", konvaImage);
      }
    };
  };
  reader.onerror = () => {
    console.warn("Failed to read image file");
  };
  reader.readAsDataURL(file);
};
export default handleImageUpload;
