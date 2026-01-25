import type Konva from "konva";

const removeObject = (stage: Konva.Stage, nodes: Partial<Konva.Node>[]) => {
  if (nodes.length === 0) return;
  nodes.forEach((node) => {
    const stageNode = stage.findOne(`#${node.attrs.id}`);
    stageNode?.destroy();
  });
  stage.batchDraw();
};
export default removeObject;
