import { TilingSprite, Texture } from "pixi.js";

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

export const createGrid = (width: number, height: number, cellSize: number = 70) => {
  const canvasPattern = createCanvasGrid(cellSize);
  const texture = Texture.from(canvasPattern);
  const grid = new TilingSprite(texture, width, height);
  grid.eventMode = "none";
  return grid;
};
