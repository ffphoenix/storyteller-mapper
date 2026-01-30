import { Container, Graphics } from "pixi.js";
import type { PixiStage } from "../sceneStage/pixiStage";
import type { SceneNode } from "../../utils/nodes/types";
import { radiansToDegrees } from "../../utils/nodes/sceneNodeUtils";

type TransformerEvent = {
  type: string;
  target: SceneTransformer;
  currentTarget: SceneTransformer;
  evt?: MouseEvent;
};

type NodeSnapshot = {
  node: SceneNode;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

type DragState = {
  startPointer: { x: number; y: number };
  nodes: NodeSnapshot[];
  lastEvent?: MouseEvent;
};

type ScaleState = DragState & {
  center: { x: number; y: number };
  startScaleX: number;
  startScaleY: number;
};

type RotateState = DragState & {
  center: { x: number; y: number };
  startAngle: number;
  startRotation: number;
};

type HandleType = "nw" | "ne" | "se" | "sw";

const HANDLE_SIZE = 8;

const createHandle = () => {
  const handle = new Graphics();
  handle.beginFill(0xffffff);
  handle.lineStyle({ width: 1, color: 0x2563eb });
  handle.drawRect(-HANDLE_SIZE / 2, -HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
  handle.endFill();
  handle.eventMode = "static";
  return handle;
};

export class SceneTransformer extends Container {
  __scene = {
    id: "transformer",
    className: "Transformer",
    name: "Transformer",
    layerId: "",
    attrs: {},
  };

  private stage: PixiStage;
  private selectedNodes: SceneNode[] = [];
  private boundsGraphic: Graphics;
  private handles: Record<HandleType, Graphics>;
  private rotationHandle: Graphics;
  private listeners: Map<string, Set<(e: TransformerEvent) => void>> = new Map();
  private dragState: DragState | null = null;
  private scaleState: ScaleState | null = null;
  private rotateState: RotateState | null = null;
  private bounds = { x: 0, y: 0, width: 0, height: 0 };
  private scaleMoveHandler: ((event: any) => void) | null = null;

  constructor(stage: PixiStage) {
    super();
    this.stage = stage;
    this.eventMode = "static";
    this.boundsGraphic = new Graphics();
    this.boundsGraphic.eventMode = "static";
    this.boundsGraphic.cursor = "move";
    this.boundsGraphic.on("pointerdown", this.onDragStart);
    this.addChild(this.boundsGraphic);

    this.handles = {
      nw: createHandle(),
      ne: createHandle(),
      se: createHandle(),
      sw: createHandle(),
    };
    this.handles.nw.cursor = "nwse-resize";
    this.handles.se.cursor = "nwse-resize";
    this.handles.ne.cursor = "nesw-resize";
    this.handles.sw.cursor = "nesw-resize";
    (Object.keys(this.handles) as HandleType[]).forEach((key) => {
      const handle = this.handles[key];
      handle.on("pointerdown", (event) => this.onScaleStart(event, key));
      this.addChild(handle);
    });

    this.rotationHandle = new Graphics();
    this.rotationHandle.beginFill(0x2563eb);
    this.rotationHandle.drawCircle(0, 0, HANDLE_SIZE / 2);
    this.rotationHandle.endFill();
    this.rotationHandle.cursor = "crosshair";
    this.rotationHandle.eventMode = "static";
    this.rotationHandle.on("pointerdown", this.onRotateStart);
    this.addChild(this.rotationHandle);

    this.visible = false;
  }

  nodes(next?: SceneNode[]) {
    if (next) {
      this.selectedNodes = next;
      this.visible = next.length > 0;
      this.__scene.attrs.scaleX = 1;
      this.__scene.attrs.scaleY = 1;
      this.__scene.attrs.rotation = 0;
      this.updateBounds();
    }
    return this.selectedNodes;
  }

  moveTo(layer: Container) {
    layer.addChild(this);
  }

  moveToTop() {
    if (!this.parent) return;
    this.parent.setChildIndex(this, this.parent.children.length - 1);
  }

  on(eventNames: string, handler: (e: TransformerEvent) => void) {
    eventNames
      .split(" ")
      .filter(Boolean)
      .forEach((name) => {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name)?.add(handler);
      });
  }

  off(eventNames: string, handler: (e: TransformerEvent) => void) {
    eventNames
      .split(" ")
      .filter(Boolean)
      .forEach((name) => {
        this.listeners.get(name)?.delete(handler);
      });
  }

  destroy(options?: any) {
    this.boundsGraphic.removeAllListeners();
    Object.values(this.handles).forEach((handle) => handle.removeAllListeners());
    this.rotationHandle.removeAllListeners();
    super.destroy(options);
  }

  getBoundsData() {
    return { ...this.bounds };
  }

  private emitEvent(name: string, evt?: MouseEvent) {
    const event: TransformerEvent = { type: name, target: this, currentTarget: this, evt };
    this.listeners.get(name)?.forEach((handler) => handler(event));
  }

  private getWorldPoint = (event: any) => {
    if (!event?.global) return null;
    return this.stage.world.toLocal(event.global);
  };

  private snapshotNodes = (): NodeSnapshot[] => {
    return this.selectedNodes.map((node) => ({
      node,
      x: node.position.x,
      y: node.position.y,
      scaleX: node.scale.x,
      scaleY: node.scale.y,
      rotation: node.rotation,
    }));
  };

  private onDragStart = (event: any) => {
    if (this.selectedNodes.length === 0) return;
    event.stopPropagation?.();
    const startPointer = this.getWorldPoint(event);
    if (!startPointer) return;
    this.dragState = {
      startPointer,
      nodes: this.snapshotNodes(),
      lastEvent: event?.originalEvent ?? event?.nativeEvent,
    };
    this.stage.app.stage.on("pointermove", this.onDragMove);
    this.stage.app.stage.on("pointerup", this.onDragEnd);
  };

  private onDragMove = (event: any) => {
    if (!this.dragState) return;
    const currentPointer = this.getWorldPoint(event);
    if (!currentPointer) return;
    const dx = currentPointer.x - this.dragState.startPointer.x;
    const dy = currentPointer.y - this.dragState.startPointer.y;
    this.dragState.nodes.forEach((snapshot) => {
      const x = snapshot.x + dx;
      const y = snapshot.y + dy;
      snapshot.node.position.set(x, y);
      snapshot.node.__scene.attrs.x = x;
      snapshot.node.__scene.attrs.y = y;
    });
    this.dragState.lastEvent = event?.originalEvent ?? event?.nativeEvent;
    this.updateBounds();
    this.stage.batchDraw();
  };

  private onDragEnd = () => {
    if (!this.dragState) return;
    this.stage.app.stage.off("pointermove", this.onDragMove);
    this.stage.app.stage.off("pointerup", this.onDragEnd);
    this.emitEvent("dragend", this.dragState.lastEvent);
    this.dragState = null;
  };

  private onScaleStart = (event: any, handle: HandleType) => {
    if (this.selectedNodes.length === 0) return;
    event.stopPropagation?.();
    const startPointer = this.getWorldPoint(event);
    if (!startPointer) return;
    const bounds = this.bounds;
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    this.scaleState = {
      startPointer,
      nodes: this.snapshotNodes(),
      center,
      startScaleX: (this.__scene.attrs.scaleX as number) ?? 1,
      startScaleY: (this.__scene.attrs.scaleY as number) ?? 1,
      lastEvent: event?.originalEvent ?? event?.nativeEvent,
    };
    this.scaleMoveHandler = (e: any) => this.onScaleMove(e, handle);
    this.stage.app.stage.on("pointermove", this.scaleMoveHandler);
    this.stage.app.stage.on("pointerup", this.onScaleEnd);
  };

  private onScaleMove = (event: any, handle: HandleType) => {
    if (!this.scaleState) return;
    const currentPointer = this.getWorldPoint(event);
    if (!currentPointer) return;
    const { center, startPointer } = this.scaleState;
    const denomX = startPointer.x - center.x || 1;
    const denomY = startPointer.y - center.y || 1;
    const scaleX = (currentPointer.x - center.x) / denomX;
    const scaleY = (currentPointer.y - center.y) / denomY;
    const safeScaleX = Math.sign(scaleX) * Math.max(Math.abs(scaleX), 0.1);
    const safeScaleY = Math.sign(scaleY) * Math.max(Math.abs(scaleY), 0.1);

    this.scaleState.nodes.forEach((snapshot) => {
      const offsetX = snapshot.x - center.x;
      const offsetY = snapshot.y - center.y;
      const x = center.x + offsetX * safeScaleX;
      const y = center.y + offsetY * safeScaleY;
      snapshot.node.position.set(x, y);
      snapshot.node.scale.set(snapshot.scaleX * safeScaleX, snapshot.scaleY * safeScaleY);
      snapshot.node.__scene.attrs.x = x;
      snapshot.node.__scene.attrs.y = y;
      snapshot.node.__scene.attrs.scaleX = snapshot.node.scale.x;
      snapshot.node.__scene.attrs.scaleY = snapshot.node.scale.y;
    });
    this.__scene.attrs.scaleX = this.scaleState.startScaleX * safeScaleX;
    this.__scene.attrs.scaleY = this.scaleState.startScaleY * safeScaleY;
    this.scaleState.lastEvent = event?.originalEvent ?? event?.nativeEvent;
    this.updateBounds();
    this.stage.batchDraw();
    void handle;
  };

  private onScaleEnd = () => {
    if (!this.scaleState) return;
    this.stage.app.stage.off("pointerup", this.onScaleEnd);
    if (this.scaleMoveHandler) {
      this.stage.app.stage.off("pointermove", this.scaleMoveHandler);
    }
    this.emitEvent("transformend", this.scaleState.lastEvent);
    this.scaleState = null;
    this.scaleMoveHandler = null;
  };

  private onRotateStart = (event: any) => {
    if (this.selectedNodes.length === 0) return;
    event.stopPropagation?.();
    const startPointer = this.getWorldPoint(event);
    if (!startPointer) return;
    const bounds = this.bounds;
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const startAngle = Math.atan2(startPointer.y - center.y, startPointer.x - center.x);
    this.rotateState = {
      startPointer,
      startAngle,
      center,
      nodes: this.snapshotNodes(),
      startRotation: (this.__scene.attrs.rotation as number) ?? 0,
      lastEvent: event?.originalEvent ?? event?.nativeEvent,
    };
    this.stage.app.stage.on("pointermove", this.onRotateMove);
    this.stage.app.stage.on("pointerup", this.onRotateEnd);
  };

  private onRotateMove = (event: any) => {
    if (!this.rotateState) return;
    const currentPointer = this.getWorldPoint(event);
    if (!currentPointer) return;
    const { center, startAngle } = this.rotateState;
    const angle = Math.atan2(currentPointer.y - center.y, currentPointer.x - center.x);
    const delta = angle - startAngle;

    this.rotateState.nodes.forEach((snapshot) => {
      const dx = snapshot.x - center.x;
      const dy = snapshot.y - center.y;
      const cos = Math.cos(delta);
      const sin = Math.sin(delta);
      const x = center.x + dx * cos - dy * sin;
      const y = center.y + dx * sin + dy * cos;
      snapshot.node.position.set(x, y);
      snapshot.node.rotation = snapshot.rotation + delta;
      snapshot.node.__scene.attrs.x = x;
      snapshot.node.__scene.attrs.y = y;
      snapshot.node.__scene.attrs.rotation = radiansToDegrees(snapshot.node.rotation);
    });
    this.__scene.attrs.rotation = this.rotateState.startRotation + radiansToDegrees(delta);
    this.rotateState.lastEvent = event?.originalEvent ?? event?.nativeEvent;
    this.updateBounds();
    this.stage.batchDraw();
  };

  private onRotateEnd = () => {
    if (!this.rotateState) return;
    this.stage.app.stage.off("pointermove", this.onRotateMove);
    this.stage.app.stage.off("pointerup", this.onRotateEnd);
    this.emitEvent("transformend", this.rotateState.lastEvent);
    this.rotateState = null;
  };

  updateBounds() {
    if (this.selectedNodes.length === 0) {
      this.visible = false;
      return;
    }
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    this.selectedNodes.forEach((node) => {
      const bounds = node.getBounds();
      const topLeft = this.stage.world.toLocal({ x: bounds.x, y: bounds.y });
      const bottomRight = this.stage.world.toLocal({ x: bounds.x + bounds.width, y: bounds.y + bounds.height });
      minX = Math.min(minX, topLeft.x);
      minY = Math.min(minY, topLeft.y);
      maxX = Math.max(maxX, bottomRight.x);
      maxY = Math.max(maxY, bottomRight.y);
    });
    if (!isFinite(minX) || !isFinite(minY)) return;
    this.bounds = {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
    const centerX = this.bounds.x + this.bounds.width / 2;
    const centerY = this.bounds.y + this.bounds.height / 2;
    this.__scene.attrs.x = centerX;
    this.__scene.attrs.y = centerY;
    this.__scene.attrs.width = this.bounds.width;
    this.__scene.attrs.height = this.bounds.height;
    this.__scene.attrs.offsetX = this.bounds.width / 2;
    this.__scene.attrs.offsetY = this.bounds.height / 2;
    this.drawBounds();
    this.visible = true;
  }

  private drawBounds() {
    const { x, y, width, height } = this.bounds;
    this.boundsGraphic.clear();
    this.boundsGraphic.lineStyle({ width: 1, color: 0x3b82f6, alpha: 1 });
    this.boundsGraphic.drawRect(x, y, width, height);

    this.handles.nw.position.set(x, y);
    this.handles.ne.position.set(x + width, y);
    this.handles.se.position.set(x + width, y + height);
    this.handles.sw.position.set(x, y + height);

    this.rotationHandle.position.set(x + width / 2, y - 20);
  }
}
