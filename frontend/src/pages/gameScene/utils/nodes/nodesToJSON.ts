import Konva from "konva";

const nodesToJSON = (objects: Konva.Node | Konva.Node[]): Partial<Konva.Node>[] => {
  if (Array.isArray(objects)) {
    return objects.map((obj) => JSON.parse(obj.toJSON()));
  }
  return [JSON.parse(objects.toJSON())];
};
export default nodesToJSON;
