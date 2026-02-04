import clearTransformerNodesSelection from "../../sceneTransformer/clearTransformerNodesSelection";
import type { PixiStage } from "../../sceneStage/pixiStage";
import type { SceneNodeJSON, SceneNode } from "../../../utils/nodes/types";
import type { TransformProps } from "../../sceneTransformer/types";
import { radiansToDegrees, isSceneNode } from "../../../utils/nodes/sceneNodeUtils";

type Matrix2D = {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
};

const identityMatrix = (): Matrix2D => ({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });

const multiplyMatrix = (m1: Matrix2D, m2: Matrix2D): Matrix2D => ({
  a: m1.a * m2.a + m1.b * m2.c,
  b: m1.a * m2.b + m1.b * m2.d,
  c: m1.c * m2.a + m1.d * m2.c,
  d: m1.c * m2.b + m1.d * m2.d,
  tx: m1.tx * m2.a + m1.ty * m2.c + m2.tx,
  ty: m1.tx * m2.b + m1.ty * m2.d + m2.ty,
});

const invertMatrix = (m: Matrix2D): Matrix2D => {
  const det = m.a * m.d - m.b * m.c || 1;
  const a = m.d / det;
  const b = -m.b / det;
  const c = -m.c / det;
  const d = m.a / det;
  const tx = (m.c * m.ty - m.d * m.tx) / det;
  const ty = (m.b * m.tx - m.a * m.ty) / det;
  return { a, b, c, d, tx, ty };
};

const matrixFromTransform = (props: TransformProps): Matrix2D => {
  const rotation = ((props.rotation ?? 0) * Math.PI) / 180;
  const scaleX = props.scaleX ?? 1;
  const scaleY = props.scaleY ?? 1;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const base = {
    a: cos * scaleX,
    b: sin * scaleX,
    c: -sin * scaleY,
    d: cos * scaleY,
    tx: props.x ?? 0,
    ty: props.y ?? 0,
  };
  const offset = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx: -(props.offsetX ?? 0),
    ty: -(props.offsetY ?? 0),
  };
  return multiplyMatrix(base, offset);
};

const decomposeMatrix = (m: Matrix2D) => {
  const scaleX = Math.sqrt(m.a * m.a + m.b * m.b) || 1;
  const scaleY = Math.sqrt(m.c * m.c + m.d * m.d) || 1;
  const rotation = Math.atan2(m.b, m.a);
  return { x: m.tx, y: m.ty, scaleX, scaleY, rotation };
};

const applyMatrixToNode = (node: SceneNode, matrix: Matrix2D) => {
  const { x, y, scaleX, scaleY, rotation } = decomposeMatrix(matrix);
  node.position.set(x, y);
  node.scale.set(scaleX, scaleY);
  node.rotation = rotation;
  node.__scene.attrs.x = x;
  node.__scene.attrs.y = y;
  node.__scene.attrs.scaleX = scaleX;
  node.__scene.attrs.scaleY = scaleY;
  node.__scene.attrs.rotation = radiansToDegrees(rotation);
};

const modifyObject = (
  stage: PixiStage,
  layerId: string,
  nodesData: SceneNodeJSON[],
  originalProps?: TransformProps,
  currentProps?: TransformProps,
) => {
  if (!originalProps || !currentProps) return;

  clearTransformerNodesSelection(stage);
  const changesLayer = stage.getLayerById(layerId);
  if (!changesLayer) return;

  const nodesOnStage = nodesData
    .map((n) => stage.findOne(`#${n.attrs.id}`))
    .filter((n): n is SceneNode => !!n && isSceneNode(n));

  if (nodesOnStage.length === 0) return;

  const originalMatrix = matrixFromTransform(originalProps);
  const currentMatrix = matrixFromTransform(currentProps);
  const delta = multiplyMatrix(currentMatrix, invertMatrix(originalMatrix));

  nodesOnStage.forEach((node) => {
    const nodeWorld = node.worldTransform;
    const nodeWorldMatrix = {
      a: nodeWorld.a,
      b: nodeWorld.b,
      c: nodeWorld.c,
      d: nodeWorld.d,
      tx: nodeWorld.tx,
      ty: nodeWorld.ty,
    };
    const newWorld = multiplyMatrix(delta, nodeWorldMatrix);
    const parentWorld = node.parent?.worldTransform;
    const parentMatrix = parentWorld
      ? { a: parentWorld.a, b: parentWorld.b, c: parentWorld.c, d: parentWorld.d, tx: parentWorld.tx, ty: parentWorld.ty }
      : identityMatrix();
    const localMatrix = multiplyMatrix(invertMatrix(parentMatrix), newWorld);
    applyMatrixToNode(node, localMatrix);
  });

  stage.batchDraw();
};

export default modifyObject;
