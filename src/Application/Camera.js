import Application from "./Application";
import * as THREE from "three"
import { OrbitControls } from  "three/examples/jsm/controls/OrbitControls"

export default class Camera {
   constructor() {
      this.application = new Application()

      this.sizes = this.application.sizes
      this.time = this.application.time
      this.scene = this.application.scene
      this.canvas = this.application.canvas

      this.setInstance()
      this.setOrbitControls()
   }

   setInstance() {
      this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 1000)
      this.instance.position.set(
         42.6207029076574, 
         14.385443160872043, 
         -5.234030837209203
      )
      this.scene.add(this.instance)
   }

   setOrbitControls() {
      this.controls = new OrbitControls(this.instance, this.canvas)
      this.controls.enableDamping = true
   }

   resize() {
      this.instance.aspect = this.sizes.width / this.sizes.height
      this.instance.updateProjectionMatrix()
   }

   update() {
      this.controls.update()
   }
}