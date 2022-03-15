import EventEmitter from "@/Application/Utils/EventEmitter.js";
import Application from "@/Application/Application.js";
import * as THREE from "three";

export default class Airplane extends EventEmitter {
  constructor() {
    super();

    this.application = new Application();
    this.scene = this.application.scene;
    this.resources = this.application.resources;
    this.time = this.application.time;
    this.debug = this.application.debug;

    this.propeller = null;
    this.airplane = null;

    this.resources.on("ready", () => {
      this.setupDebugObject();
      this.instance = this.resources.items.airplaneModel.file.scene.children[0];
      this.bakedTexture = this.resources.items.airplaneBakedTexture.file;
      this.preProcessBakedTextures();
      this.setupMaterials();
      this.attachMaterialsToObjects();
      this.scene.add(this.instance);
      this.update();
    });
  }

  setupDebugObject() {
    this.debugObject = {};

    this.debugFolder = null;
    if (this.debug.active)
      this.debugFolder = this.debug.ui.addFolder("Airplane");

    // if (this.debugFolder != null) {
    // }
  }

  preProcessBakedTextures() {
    // As the texture was baked in blender, the TOP property is messed up
    // changing FlipY to false here as otherwise the applied texture is inverted
    this.bakedTexture.flipY = false;

    // Better colors (NOTE - For this to work, the renderer should have this encoding as well)
    this.bakedTexture.encoding = THREE.sRGBEncoding;
  }

  setupMaterials() {
    this.airplaneMaterial = new THREE.MeshBasicMaterial({
      map: this.bakedTexture,
    });
  }

  attachMaterialsToObjects() {
    this.instance.traverse((child) => {
      child.material = this.airplaneMaterial;

      if (child.name == "PlanePropeller") this.propeller = child;
      else if (child.name == "AirPlane") this.airplane = child;
    });
  }

  update() {
    this.time.on("tick", () => {
      // rotate propeller
      this.propeller.rotation.z = this.time.elapsed * 0.01;

      // rotate the whole plane
      this.instance.rotation.z = this.time.elapsed * 0.0001 + Math.PI;
    });
  }
}
