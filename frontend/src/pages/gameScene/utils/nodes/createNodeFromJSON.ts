import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { parseColor } from "../colorUtils";
import type { SceneNode, SceneNodeJSON } from "./types";
import { degreesToRadians } from "./sceneNodeUtils";

const applyCommonAttrs = (node: SceneNode, attrs: Record<string, any>) => {
  if (attrs.x !== undefined) node.position.x = attrs.x;
  if (attrs.y !== undefined) node.position.y = attrs.y;
  if (attrs.scaleX !== undefined || attrs.scaleY !== undefined) {
    node.scale.set(attrs.scaleX ?? 1, attrs.scaleY ?? 1);
  }
  if (attrs.rotation !== undefined) {
    node.rotation = degreesToRadians(attrs.rotation);
  }
  if (attrs.skewX !== undefined || attrs.skewY !== undefined) {
    node.skew.set(degreesToRadians(attrs.skewX ?? 0), degreesToRadians(attrs.skewY ?? 0));
  }
  if (attrs.offsetX !== undefined || attrs.offsetY !== undefined) {
    node.pivot.set(attrs.offsetX ?? 0, attrs.offsetY ?? 0);
  }
  if (attrs.alpha !== undefined) node.alpha = attrs.alpha;
  if (attrs.visible !== undefined) node.visible = attrs.visible;
  if (attrs.name) node.name = attrs.name;
};

const attachSceneMeta = (node: SceneNode, json: SceneNodeJSON) => {
  const id = json.attrs?.id ?? "";
  const name = json.attrs?.name ?? json.attrs?.attrs?.name ?? "";
  node.__scene = {
    id,
    className: json.className,
    name,
    layerId: json.attrs?.layerId,
    attrs: { ...json.attrs },
  };
  return node;
};

const drawRect = (graphics: Graphics, attrs: Record<string, any>) => {
  const { color: strokeColor, alpha: strokeAlpha } = parseColor(attrs.stroke);
  const { color: fillColor, alpha: fillAlpha } = parseColor(attrs.fill, 0xffffff);
  const strokeWidth = attrs.strokeWidth ?? 0;
  graphics.clear();
  if (strokeWidth > 0) {
    graphics.lineStyle({ width: strokeWidth, color: strokeColor, alpha: strokeAlpha });
  }
  graphics.beginFill(fillColor, fillAlpha);
  graphics.drawRect(0, 0, attrs.width ?? 0, attrs.height ?? 0);
  graphics.endFill();
};

const drawCircle = (graphics: Graphics, attrs: Record<string, any>) => {
  const { color: strokeColor, alpha: strokeAlpha } = parseColor(attrs.stroke);
  const { color: fillColor, alpha: fillAlpha } = parseColor(attrs.fill, 0xffffff);
  const strokeWidth = attrs.strokeWidth ?? 0;
  graphics.clear();
  if (strokeWidth > 0) {
    graphics.lineStyle({ width: strokeWidth, color: strokeColor, alpha: strokeAlpha });
  }
  graphics.beginFill(fillColor, fillAlpha);
  graphics.drawCircle(0, 0, attrs.radius ?? 0);
  graphics.endFill();
};

const drawLine = (graphics: Graphics, attrs: Record<string, any>) => {
  const { color: strokeColor, alpha: strokeAlpha } = parseColor(attrs.stroke, 0x000000);
  const strokeWidth = attrs.strokeWidth ?? 1;
  const points = attrs.points ?? [];
  graphics.clear();
  graphics.lineStyle({ width: strokeWidth, color: strokeColor, alpha: strokeAlpha });
  if (points.length >= 2) {
    graphics.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      graphics.lineTo(points[i], points[i + 1]);
    }
  }
};

const drawRegularPolygon = (graphics: Graphics, attrs: Record<string, any>) => {
  const sides = Math.max(3, attrs.sides ?? 3);
  const radius = attrs.radius ?? 0;
  const { color: fillColor, alpha: fillAlpha } = parseColor(attrs.fill, 0x000000);
  graphics.clear();
  graphics.beginFill(fillColor, fillAlpha);
  const points: number[] = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  graphics.drawPolygon(points);
  graphics.endFill();
};

export const createNodeFromJSON = (json: SceneNodeJSON): SceneNode => {
  let node: SceneNode;

  switch (json.className) {
    case "Rect": {
      const rect = new Graphics();
      drawRect(rect, json.attrs ?? {});
      node = rect as SceneNode;
      break;
    }
    case "Circle": {
      const circle = new Graphics();
      drawCircle(circle, json.attrs ?? {});
      node = circle as SceneNode;
      break;
    }
    case "Line": {
      const line = new Graphics();
      drawLine(line, json.attrs ?? {});
      node = line as SceneNode;
      break;
    }
    case "RegularPolygon": {
      const polygon = new Graphics();
      drawRegularPolygon(polygon, json.attrs ?? {});
      node = polygon as SceneNode;
      break;
    }
    case "Text": {
      const text = new Text({
        text: json.attrs?.text ?? "",
        style: {
          fontSize: json.attrs?.fontSize ?? 16,
          fontFamily: json.attrs?.fontFamily ?? "Arial",
          fontWeight: json.attrs?.fontWeight ?? "normal",
          fontStyle: json.attrs?.fontStyle ?? "normal",
          fill: json.attrs?.fill ?? "#000000",
        },
      });
      node = text as SceneNode;
      break;
    }
    case "Image": {
      const source = json.attrs?.src ?? json.attrs?.image?.src ?? "";
      const texture = source ? Texture.from(source) : Texture.EMPTY;
      const sprite = new Sprite(texture);
      node = sprite as SceneNode;
      break;
    }
    case "Group": {
      const group = new Container();
      node = group as SceneNode;
      if (json.children) {
        json.children.forEach((child) => {
          const childNode = createNodeFromJSON(child);
          group.addChild(childNode);
        });
      }
      break;
    }
    default: {
      const fallback = new Container();
      node = fallback as SceneNode;
      break;
    }
  }

  attachSceneMeta(node, json);
  applyCommonAttrs(node, json.attrs ?? {});
  node.eventMode = "static";
  return node;
};

export const updateNodeGeometry = (node: SceneNode) => {
  const attrs = node.__scene.attrs;
  if (node.__scene.className === "Rect" && node instanceof Graphics) {
    drawRect(node, attrs);
  }
  if (node.__scene.className === "Circle" && node instanceof Graphics) {
    drawCircle(node, attrs);
  }
  if (node.__scene.className === "Line" && node instanceof Graphics) {
    drawLine(node, attrs);
  }
  if (node.__scene.className === "RegularPolygon" && node instanceof Graphics) {
    drawRegularPolygon(node, attrs);
  }
  if (node.__scene.className === "Text" && node instanceof Text) {
    node.text = attrs.text ?? node.text;
    node.style = {
      ...node.style,
      fontSize: attrs.fontSize ?? node.style.fontSize,
      fontFamily: attrs.fontFamily ?? node.style.fontFamily,
      fontWeight: attrs.fontWeight ?? node.style.fontWeight,
      fontStyle: attrs.fontStyle ?? node.style.fontStyle,
      fill: attrs.fill ?? (node.style.fill as string),
    };
  }
  if (node.__scene.className === "Image" && node instanceof Sprite) {
    const source = attrs.src ?? attrs.image?.src ?? "";
    if (source) {
      node.texture = Texture.from(source);
    }
  }
};
