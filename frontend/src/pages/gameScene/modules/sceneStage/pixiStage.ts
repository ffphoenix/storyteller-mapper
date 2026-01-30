import { Application, Container, Rectangle } from "pixi.js";
import type { SceneNode, SceneNodeJSON, SceneLayer } from "../../utils/nodes/types";
import { createNodeFromJSON } from "../../utils/nodes/createNodeFromJSON";
import { isSceneNode } from "../../utils/nodes/sceneNodeUtils";

export type ScenePointerEvent = {
  evt: MouseEvent | WheelEvent | PointerEvent;
  target: SceneNode | null;
  currentTarget: SceneNode | null;
  originalEvent: unknown;
  type: string;
};

export type PixiStage = {
  app: Application;
  view: HTMLCanvasElement;
  containerEl: HTMLDivElement;
  world: Container;
  overlay: Container;
  layers: Map<string, SceneLayer>;
  on: (eventNames: string, handler: (e: ScenePointerEvent) => void) => void;
  off: (eventNames: string, handler: (e: ScenePointerEvent) => void) => void;
  getPointerPosition: () => { x: number; y: number } | null;
  getWorldPointerPosition: () => { x: number; y: number } | null;
  container: () => HTMLDivElement;
  width: () => number;
  height: () => number;
  scale: (value: { x: number; y: number }) => void;
  scaleX: () => number;
  scaleY: () => number;
  position: (value: { x: number; y: number }) => void;
  x: () => number;
  y: () => number;
  batchDraw: () => void;
  findOne: (selector: string) => SceneNode | null;
  getLayers: () => SceneLayer[];
  getLayerById: (id: string) => SceneLayer | null;
  destroy: () => void;
};

const wrapPointerEvent = (
  eventName: string,
  rawEvent: any,
  target: SceneNode | null,
  currentTarget: SceneNode | null,
): ScenePointerEvent => {
  const original = rawEvent?.originalEvent ?? rawEvent?.nativeEvent ?? rawEvent;
  return {
    evt: original as MouseEvent,
    target,
    currentTarget,
    originalEvent: rawEvent,
    type: eventName,
  };
};

const findInContainer = (container: Container, matcher: (node: SceneNode) => boolean): SceneNode | null => {
  for (const child of container.children) {
    if (isSceneNode(child) && matcher(child)) {
      return child;
    }
    if (child instanceof Container) {
      const result = findInContainer(child, matcher);
      if (result) return result;
    }
  }
  return null;
};

export const createPixiStage = async (containerEl: HTMLDivElement, stageJSON: SceneNodeJSON): Promise<PixiStage> => {
  const config = {
    backgroundAlpha: 0,
    antialias: true,
    resizeTo: containerEl,
    resolution: window.devicePixelRatio || 1,
  };
  let app = new Application();
  if (typeof (app as any).init === "function") {
    await (app as any).init(config);
  } else {
    app = new Application(config as any);
  }

  const view = ((app as any).canvas ?? (app as any).view) as HTMLCanvasElement;
  containerEl.innerHTML = "";
  view.style.display = "block";
  view.style.width = "100%";
  view.style.height = "100%";
  view.style.touchAction = "none";
  containerEl.appendChild(view);

  const world = new Container();
  const overlay = new Container();
  app.stage.addChild(world);

  app.stage.eventMode = "static";
  app.stage.hitArea = new Rectangle(0, 0, containerEl.clientWidth, containerEl.clientHeight);

  const layers = new Map<string, SceneLayer>();
  const stageChildren = stageJSON?.children ?? [];
  stageChildren
    .filter((child) => child.className === "Layer")
    .forEach((layerJSON) => {
      const layer = new Container() as SceneLayer;
      layer.__scene = { id: layerJSON.attrs?.id ?? "", className: "Layer" };
      world.addChild(layer);
      layers.set(layer.__scene.id, layer);
      (layerJSON.children ?? []).forEach((nodeJSON) => {
        const node = createNodeFromJSON(nodeJSON);
        node.__scene.layerId = layer.__scene.id;
        layer.addChild(node);
      });
    });
  world.addChild(overlay);

  let lastPointer: { x: number; y: number } | null = null;

  const eventMap = new Map<string, Map<(e: ScenePointerEvent) => void, (e: any) => void>>();

  const on = (eventNames: string, handler: (e: ScenePointerEvent) => void) => {
    eventNames
      .split(" ")
      .filter(Boolean)
      .forEach((eventName) => {
        if (eventName === "wheel") {
          const wheelHandler = (evt: WheelEvent) => {
            const rect = view.getBoundingClientRect();
            lastPointer = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
            handler(wrapPointerEvent("wheel", evt, null, null));
          };
          view.addEventListener("wheel", wheelHandler, { passive: false });
          if (!eventMap.has(eventName)) eventMap.set(eventName, new Map());
          eventMap.get(eventName)?.set(handler, wheelHandler);
          return;
        }

        const pixiEvent =
          eventName === "mousedown" || eventName === "touchstart"
            ? "pointerdown"
            : eventName === "mousemove" || eventName === "touchmove"
              ? "pointermove"
              : eventName === "mouseup" || eventName === "touchend"
                ? "pointerup"
                : eventName;

        const pixiHandler = (evt: any) => {
          if (evt?.global) {
            lastPointer = { x: evt.global.x, y: evt.global.y };
          }
          const target = isSceneNode(evt?.target as SceneNode) ? (evt.target as SceneNode) : null;
          handler(wrapPointerEvent(eventName, evt, target, target));
        };
        app.stage.on(pixiEvent, pixiHandler);
        if (!eventMap.has(eventName)) eventMap.set(eventName, new Map());
        eventMap.get(eventName)?.set(handler, pixiHandler);
      });
  };

  const off = (eventNames: string, handler: (e: ScenePointerEvent) => void) => {
    eventNames
      .split(" ")
      .filter(Boolean)
      .forEach((eventName) => {
        const handlerMap = eventMap.get(eventName);
        const registered = handlerMap?.get(handler);
        if (!registered) return;
        if (eventName === "wheel") {
          view.removeEventListener("wheel", registered as EventListener);
        } else {
          const pixiEvent =
            eventName === "mousedown" || eventName === "touchstart"
              ? "pointerdown"
              : eventName === "mousemove" || eventName === "touchmove"
                ? "pointermove"
                : eventName === "mouseup" || eventName === "touchend"
                  ? "pointerup"
                  : eventName;
          app.stage.off(pixiEvent, registered as any);
        }
        handlerMap?.delete(handler);
      });
  };

  const getPointerPosition = () => lastPointer;

  const getWorldPointerPosition = () => {
    if (!lastPointer) return null;
    return world.toLocal(lastPointer);
  };

  const findOne = (selector: string) => {
    if (selector.startsWith("#")) {
      const id = selector.slice(1);
      for (const layer of layers.values()) {
        if (layer.__scene.id === id) return layer as unknown as SceneNode;
        const node = findInContainer(layer, (child) => child.__scene.id === id);
        if (node) return node;
      }
      const overlayNode = findInContainer(overlay, (child) => child.__scene.id === id);
      if (overlayNode) return overlayNode;
      return null;
    }
    const node = findInContainer(world, (child) => child.__scene.className === selector || child.__scene.name === selector);
    if (node) return node;
    return findInContainer(overlay, (child) => child.__scene.className === selector || child.__scene.name === selector);
  };

  const getLayers = () => Array.from(layers.values());

  const getLayerById = (id: string) => layers.get(id) ?? null;

  const stage: PixiStage = {
    app,
    view,
    containerEl,
    world,
    overlay,
    layers,
    on,
    off,
    getPointerPosition,
    getWorldPointerPosition,
    container: () => containerEl,
    width: () => app.screen.width,
    height: () => app.screen.height,
    scale: (value) => {
      world.scale.set(value.x, value.y);
    },
    scaleX: () => world.scale.x,
    scaleY: () => world.scale.y,
    position: (value) => {
      world.position.set(value.x, value.y);
    },
    x: () => world.position.x,
    y: () => world.position.y,
    batchDraw: () => {
      if (typeof (app as any).render === "function") {
        (app as any).render();
      } else {
        app.renderer.render(app.stage);
      }
    },
    findOne,
    getLayers,
    getLayerById,
    destroy: () => {
      app.destroy(true, { children: true });
      containerEl.innerHTML = "";
    },
  };

  return stage;
};
