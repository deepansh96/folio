import Application from "@/Application/Application.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Camera {
  constructor() {
    this.application = new Application();

    this.sizes = this.application.sizes;
    this.time = this.application.time;
    this.scene = this.application.scene;
    this.canvas = this.application.canvas;

    this.setInstance();
    this.setOrbitControls();
    if (this.application.debug.active) this.setupDebugUI();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    // camera on left side facing spaceship
    // this.instance.position.set(
    //    63.87959642625752,
    //    21.391313536522055,
    //    -7.381384095767814
    // )

    // camera in center
    this.instance.position.set(
      68.26343028238043,
      18.306943247163723,
      -13.541610727164217
    );
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;

    // target on spaceship
    // this.controls.target.set(
    //    3.7931512036530215,
    //    -0.17218206601113725,
    //    18.86354188209718
    // )

    // target on planetPrime
    this.controls.target.set(
      5.697488577759573,
      3.0258570954629667,
      -1.2271074242097544
    );
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }

  setupDebugUI() {
    this.debug = this.application.debug;
    this.debugFolder = this.debug.ui.addFolder("Camera");
    this.debugObject = {
      enableCameraPositionLogging: false,
      enableOrbitControls: true,
    };

    let logCameraPosition = () => {
      console.log(this.instance.position);
      console.log(this.controls.target);
    };

    this.debugFolder
      .add(this.debugObject, "enableCameraPositionLogging")
      .name("Log Camera Position")
      .onFinishChange((value) => {
        console.log(this.controls);
        if (value) this.controls.addEventListener("change", logCameraPosition);
        else this.controls.removeEventListener("change", logCameraPosition);
      });

    this.debugFolder
      .add(this.debugObject, "enableOrbitControls")
      .name("Orbit Controls")
      .onFinishChange((value) => {
        this.controls.enabled = value ? true : false;
      });
  }
}
