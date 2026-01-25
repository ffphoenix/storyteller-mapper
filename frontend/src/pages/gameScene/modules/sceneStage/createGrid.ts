import Konva from "konva";

// TODO: try to do the same with SVG
const createCanvasGrid = (size: number) => {
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
  }

  return canvas;
};

const convertCanvasToImage = (canvas: HTMLCanvasElement) => {
  const image = new Image(canvas.width, canvas.height);
  image.src = canvas.toDataURL();
  return image;
};

const createGrid = (layer: Konva.Layer) => {
  const canvasPattern = convertCanvasToImage(createCanvasGrid(70));

  const gridRect = new Konva.Rect({
    stroke: "rgba(0, 0, 0, 1)",
    strokeWidth: 2,
    x: 0,
    y: 0,
    fillPatternImage: canvasPattern,
    fillPatternRepeat: "repeat",
    listening: false,
  });
  // TODO: integrate this configuration
  gridRect.width(50 * 70);
  gridRect.height(50 * 70);
  gridRect.moveTo(layer);
  // TODO: find out why cache doesn't work
  gridRect.cache();

  return gridRect;
};

export default createGrid;
