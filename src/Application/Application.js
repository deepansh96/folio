import Sizes from "@/Application/Utils/Sizes.js";
import Time from "@/Application/Utils/Time.js";
import Resources from "@/Application/Utils/Resources.js";
import * as THREE from "three";
import Camera from "@/Application/Camera.js";
import Renderer from "@/Application/Renderer.js";
import World from "@/Application/World/World.js";
import sources from "@/Application/Utils/sources.js";
import Debug from "@/Application/Utils/Debug.js";

let instance = null;

export default class Application {
  constructor(_options) {
    if (instance) return instance;
    instance = this;

    this.canvas = _options.canvas;
    window.webGLApplication = this;

    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    this.sizes.on("resize", () => this.resize());
    this.time.on("tick", () => this.update());
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.renderer.update();
  }
}
