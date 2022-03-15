import Application from "@/Application/Application.js";
import * as THREE from "three";

export default class Satellite {
   constructor() {
      this.application = new Application();
      this.scene = this.application.scene;
      this.resources = this.application.resources;
      this.time = this.application.time;
      this.debug = this.application.debug;

      this.resources.on("ready", () => {
         this.setupDebugObject();
         this.instance = this.resources.items.satelliteModel.file.scene;
         this.bakedTexture = this.resources.items.satelliteBakedTexture.file;
         this.preProcessBakedTextures()
         this.setupMaterials();
         this.attachMaterialsToObjects();
         this.scene.add(this.instance);
         this.update()
       });
   }

   setupDebugObject() {
      this.debugObject = {
      }

      this.debugFolder = null;
      if (this.debug.active)
         this.debugFolder = this.debug.ui.addFolder("Satellite")
      
      // if(this.debugFolder != null) {
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
      this.satelliteMaterial = new THREE.MeshBasicMaterial({
         map: this.bakedTexture
      })

      this.lightMaterial = new THREE.ShaderMaterial({
         uniforms: {
            uTime: { value: 0.1 }
         },
         vertexShader: `
            void main()
            {
               vec4 modelPosition = modelMatrix * vec4(position, 1.0);
               vec4 viewPosition = viewMatrix * modelPosition;
               vec4 projectionPosition = projectionMatrix * viewPosition;
            
               gl_Position = projectionPosition;
            }
         `,
         fragmentShader: `
            uniform float uTime;
            void main()
            {
               // blinking lights
               gl_FragColor = vec4(
                  vec3(clamp(0.5, 2.0, 2.0 * abs(sin(uTime * 0.001)))),
                  1.0
               );
            }
         `,
      })
   }

   attachMaterialsToObjects() {
      this.instance.traverse((child) => {
         if (child instanceof THREE.Mesh) {
            if (child.name == "Light") {
               this.lightMesh = child
               child.material = this.lightMaterial
            } 
            else child.material = this.satelliteMaterial
         }
       });
   }

   update() {
      this.time.on("tick", () => {
         // local and global rotation of the satellite
         this.instance.children[0].rotation.z = (Math.PI / 4) * Math.sin(this.time.elapsed * 0.0005)
         this.instance.children[0].rotation.y = (Math.PI / 12) * Math.cos(this.time.elapsed * 0.0005) - Math.PI / 12
         this.instance.rotation.y = - (Math.PI / 8) * Math.cos(this.time.elapsed * 0.0001) + Math.PI / 8

         // blinking of lights as time passes by
         this.lightMesh.material.uniforms.uTime.value = this.time.elapsed
       });
   }
}