import Application from "@/Application/Application.js";
import EventEmitter from "@/Application/Utils/EventEmitter.js";
import * as THREE from "three";
import { injectIntoShader } from "@/Application/Utils/Shaders.js";
import seaMaterialVShader from "@/Application/InjectableShaders/planetPrime/sea/vertex.js";
import seaMaterialFShader from "@/Application/InjectableShaders/planetPrime/sea/fragment.js";
import aliveTreeMaterialVShader from "@/Application/InjectableShaders/planetPrime/aliveTrees/vertex.js";

export default class PlanetPrime extends EventEmitter {
  constructor() {
    super();
    this.application = new Application();
    this.scene = this.application.scene;
    this.resources = this.application.resources;
    this.time = this.application.time;
    this.debug = this.application.debug;

    this.resources.on("ready", () => {
      this.instance = this.resources.items.planetPrimeModel.file.scene;
      this.preProcessBakedTextures();
      this.setupMaterials();
      this.attachMaterialsToObjects();
      this.injectCustomShaders();
      this.scene.add(this.instance);
      this.update();
      this.setupDebugObject();

      this.trigger("ready");
    });
  }

  setupDebugObject() {
    this.debugObject = {
      uBigWavesElevation: {
        value: this.customUniforms.uBigWavesElevation.value,
      },
      uBigWavesFrequency: {
        value: this.customUniforms.uBigWavesFrequency.value,
      },
      uBigWaveSpeed: { value: this.customUniforms.uBigWaveSpeed.value },
      uColorOffset: { value: this.customUniforms.uColorOffset.value },
      uColorMultiplier: { value: this.customUniforms.uColorMultiplier.value },
      uAliveTreeAmplitude: {
        value: this.customUniforms.uAliveTreeAmplitude.value,
      },
      uAliveTreeFrequency: {
        value: this.customUniforms.uAliveTreeFrequency.value,
      },
    };

    this.debugFolder = null;
    if (this.debug.active)
      this.debugFolder = this.debug.ui.addFolder("PlanetPrime");

    if (this.debugFolder != null) {
      this.debugFolder
        .add(this.debugObject.uBigWavesElevation, "value")
        .min(0)
        .max(10)
        .step(0.001)
        .name("uBigWavesElevation")
        .onChange(
          () =>
            (this.customUniforms.uBigWavesElevation.value = this.debugObject.uBigWavesElevation.value)
        );

      this.debugFolder
        .add(this.debugObject.uBigWavesFrequency.value, "x")
        .min(0)
        .max(10)
        .step(0.001)
        .name("uBigWavesFrequencyX")
        .onChange(
          () =>
            (this.customUniforms.uBigWavesFrequency.value.x = this.debugObject.uBigWavesFrequency.value.x)
        );

      this.debugFolder
        .add(this.debugObject.uBigWavesFrequency.value, "y")
        .min(0)
        .max(10)
        .step(0.001)
        .name("uBigWavesFrequencyY")
        .onChange(
          () =>
            (this.customUniforms.uBigWavesFrequency.value.y = this.debugObject.uBigWavesFrequency.value.y)
        );

      this.debugFolder
        .add(this.debugObject.uBigWaveSpeed, "value")
        .min(0)
        .max(10)
        .step(0.001)
        .name("uBigWaveSpeed")
        .onChange(
          () =>
            (this.customUniforms.uBigWaveSpeed.value = this.debugObject.uBigWaveSpeed.value)
        );

      this.debugFolder
        .add(this.debugObject.uColorOffset, "value")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("uColorOffset")
        .onChange(
          () =>
            (this.customUniforms.uColorOffset.value = this.debugObject.uColorOffset.value)
        );

      this.debugFolder
        .add(this.debugObject.uColorMultiplier, "value")
        .min(0)
        .max(1)
        .step(0.001)
        .name("uColorMultiplier")
        .onChange(
          () =>
            (this.customUniforms.uColorMultiplier.value = this.debugObject.uColorMultiplier.value)
        );

      this.debugFolder
        .add(this.debugObject.uAliveTreeAmplitude, "value")
        .min(-5)
        .max(5)
        .step(0.001)
        .name("uAliveTreeAmplitude")
        .onChange(
          () =>
            (this.customUniforms.uAliveTreeAmplitude.value = this.debugObject.uAliveTreeAmplitude.value)
        );

      this.debugFolder
        .add(this.debugObject.uAliveTreeFrequency, "value")
        .min(-5)
        .max(5)
        .step(0.001)
        .name("uAliveTreeFrequency")
        .onChange(
          () =>
            (this.customUniforms.uAliveTreeFrequency.value = this.debugObject.uAliveTreeFrequency.value)
        );
    }
  }

  setupMaterials() {
    // material for planet EXCEPT SEA
    this.planetBakedMaterial = new THREE.MeshBasicMaterial({
      map: this.bakedTexture,
    });

    // material for sea
    this.seaMaterial = new THREE.MeshBasicMaterial({
      map: this.bakedTexture,
    });

    // material for trees
    this.aliveTreeMaterial = new THREE.MeshBasicMaterial({
      map: this.bakedTexture,
    });
  }

  attachMaterialsToObjects() {
    this.instance.traverse((child) => {
      if (child.name == "PlanetWater") child.material = this.seaMaterial;
      else if (
        child.name.toLowerCase().includes("tree") &&
        !child.name.toLowerCase().includes("dead")
      )
        child.material = this.aliveTreeMaterial;
      else child.material = this.planetBakedMaterial;
    });
  }

  injectCustomShaders() {
    this.customUniforms = {
      uTime: {
        value: 0.0,
      },
      uBigWavesElevation: {
        value: 0.99,
      },
      uBigWavesFrequency: {
        value: new THREE.Vector2(5.5, 2.05),
      },
      uBigWaveSpeed: {
        value: 1.2,
      },
      uColorOffset: {
        value: -0.415,
      },
      uColorMultiplier: {
        value: 0.123,
      },
      uAliveTreeAmplitude: {
        value: 0.04,
      },
      uAliveTreeFrequency: {
        value: 2.7,
      },
    };

    this.seaMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.customUniforms.uTime;
      shader.uniforms.uBigWavesElevation = this.customUniforms.uBigWavesElevation;
      shader.uniforms.uBigWavesFrequency = this.customUniforms.uBigWavesFrequency;
      shader.uniforms.uBigWaveSpeed = this.customUniforms.uBigWaveSpeed;
      shader.uniforms.uColorOffset = this.customUniforms.uColorOffset;
      shader.uniforms.uColorMultiplier = this.customUniforms.uColorMultiplier;

      shader.vertexShader = injectIntoShader(
        seaMaterialVShader,
        shader.vertexShader
      );
      shader.fragmentShader = injectIntoShader(
        seaMaterialFShader,
        shader.fragmentShader
      );
    };

    this.aliveTreeMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.customUniforms.uTime;
      shader.uniforms.uAliveTreeAmplitude = this.customUniforms.uAliveTreeAmplitude;
      shader.uniforms.uAliveTreeFrequency = this.customUniforms.uAliveTreeFrequency;

      shader.vertexShader = injectIntoShader(
        aliveTreeMaterialVShader,
        shader.vertexShader
      );
    };
  }

  update() {
    this.time.on("tick", () => {
      this.customUniforms.uTime.value = this.time.elapsed * 0.001;
    });
  }

  preProcessBakedTextures() {
    // As the texture was baked in blender, the TOP property is messed up
    // changing FlipY to false otherwise the applied texture is inverted
    this.bakedTexture = this.resources.items.planetPrimeBakedTexture.file;
    this.bakedTexture.flipY = false;

    // Better colors (NOTE - For this to work, the renderer should have this encoding as well)
    this.bakedTexture.encoding = THREE.sRGBEncoding;
  }
}
