import type { Container, DisplayObject } from "pixi.js";

export type SceneNodeClass =
  | "Rect"
  | "Circle"
  | "Line"
  | "Text"
  | "RegularPolygon"
  | "Image"
  | "Group"
  | "Layer"
  | "Transformer";

export type SceneNodeJSON = {
  className: SceneNodeClass;
  attrs: Record<string, any>;
  children?: SceneNodeJSON[];
};

export type SceneNodeMeta = {
  id: string;
  className: SceneNodeClass;
  name?: string;
  layerId?: string;
  attrs: Record<string, any>;
};

export type SceneNode = DisplayObject & {
  __scene: SceneNodeMeta;
};

export type SceneLayer = Container & {
  __scene: {
    id: string;
    className: "Layer";
    name?: string;
  };
};
