import sceneStore from "../SceneStore";

export default async function loadScene() {
  try {
    const scene = { };
    sceneStore.updateSceneData(scene);

  } catch (e) {
    console.error(e);
  }
}
