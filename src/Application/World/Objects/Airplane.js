import EventEmitter from "@/Application/Utils/EventEmitter.js"
import Application from "@/Application/Application.js";
import * as THREE from "three"
import { Object3D } from "three";

export default class Airplane extends EventEmitter{
   constructor() {
      super()

      this.application = new Application()
      this.scene = this.application.scene
      this.resources = this.application.resources
      this.time = this.application.time
      this.debug = this.application.debug

      this.propeller = null

      this.resources.on('ready', () => {
         this.setupDebugObject()
         this.instance = this.resources.items.airplaneModel.file.scene
         this.bakedTexture = this.resources.items.airplaneBakedTexture.file
         this.preProcessBakedTextures()
         this.setupMaterials()
         this.attachMaterialsToObjects()
         this.scene.add(this.instance)

         this.rotateAroundPlanet()
         this.update()
      })
   }

   setupDebugObject() {
      this.debugObject = {
         pivotRotation: {
            x: Math.PI / 2,
            y: Math.PI / 2,
            z: Math.PI / 2,
         }
      }

      this.debugFolder = null
      if (this.debug.active)
         this.debugFolder = this.debug.ui.addFolder('Airplane')

      if (this.debugFolder != null) {
         this.debugFolder
            .add(this.debugObject.pivotRotation, 'x')
            .min(0)
            .max(Math.PI * 2)
            .step(0.00001)
            .onChange((value) => this.pivot.rotation.x = value)
         
         this.debugFolder
            .add(this.debugObject.pivotRotation, 'y')
            .min(0)
            .max(Math.PI * 2)
            .step(0.00001)
            .onChange((value) => this.pivot.rotation.y = value)

         this.debugFolder
            .add(this.debugObject.pivotRotation, 'z')
            .min(0)
            .max(Math.PI * 2)
            .step(0.00001)
            .onChange((value) => this.pivot.rotation.z = value)
      }
   }

   preProcessBakedTextures() {
      // As the texture was baked in blender, the TOP property is messed up
      // changing FlipY to false here as otherwise the applied texture is inverted 
      this.bakedTexture.flipY = false

      // Better colors (NOTE - For this to work, the renderer should have this encoding as well)
      this.bakedTexture.encoding = THREE.sRGBEncoding
   }

   setupMaterials() {
      this.airplaneMaterial = new THREE.MeshBasicMaterial({
         map: this.bakedTexture
      })
   }

   attachMaterialsToObjects() {
      this.instance.traverse((child) => {
         child.material = this.airplaneMaterial

         if (child.name == 'PlanePropeller') this.propeller = child
      })
   }

   rotateAroundPlanet() {
      // https://stackoverflow.com/questions/44287255/whats-the-right-way-to-rotate-an-object-around-a-point-in-three-js
      this.pivot = new Object3D()
      this.pivot.add(this.instance)
      this.scene.add(this.pivot)

      this.pivot.rotation.x = Math.PI * 2
      this.pivot.rotation.z = Math.PI * 2
   }

   update() {
      this.time.on('tick', () => {
         this.propeller.rotation.z = this.time.elapsed * 0.01
         this.pivot.rotation.x -= 0.001;
         this.pivot.rotation.z += 0.001;
      })
   }

}