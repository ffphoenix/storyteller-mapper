import Konva from "konva";
import clearTransformerNodesSelection from "../../sceneTransformer/clearTransformerNodesSelection";

const modifyObject = (
  stage: Konva.Stage,
  layerId: string,
  nodesData: Partial<Konva.Node>[],
  originalProps?: Partial<Konva.NodeConfig>,
  currentProps?: Partial<Konva.NodeConfig>,
) => {
  if (!originalProps || !currentProps) return;

  clearTransformerNodesSelection(stage);
  const changesLayer = stage.findOne(`#${layerId}`) as Konva.Layer;
  if (!changesLayer) return;

  const nodesOnStage = nodesData.map((n) => stage.findOne(`#${n.attrs.id}`)).filter((n): n is Konva.Node => !!n);

  if (nodesOnStage.length === 0) return;

  const tempGroup = new Konva.Group({
    x: currentProps.x,
    y: currentProps.y,
    rotation: currentProps.rotation ?? 0,
    scaleX: currentProps.scaleX ?? 1,
    scaleY: currentProps.scaleY ?? 1,
    offsetX: currentProps.offsetX ?? 0,
    offsetY: currentProps.offsetY ?? 0,
  });

  changesLayer.add(tempGroup);

  nodesOnStage.forEach((node) => {
    const transform = node.getAbsoluteTransform().copy();
    node.moveTo(tempGroup);

    const multiply = tempGroup.getAbsoluteTransform().copy().invert().multiply(transform);
    const attrs = multiply.decompose();
    node.setAttrs(attrs);
  });
  // TODO: fix history scale bug
  tempGroup.setAttrs({
    x: originalProps.x,
    y: originalProps.y,
    rotation: originalProps.rotation ?? 0,
    scaleX: originalProps.scaleX ?? 1,
    scaleY: originalProps.scaleY ?? 1,
  });

  nodesOnStage.forEach((node) => {
    const transform = node.getAbsoluteTransform().copy();
    node.moveTo(changesLayer);

    const multiplyTransform = changesLayer.getAbsoluteTransform().copy().invert().multiply(transform);
    const attrs = multiplyTransform.decompose();
    node.setAttrs(attrs);
  });

  tempGroup.destroy();
  stage.batchDraw();
};

export default modifyObject;
