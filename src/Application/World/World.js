import Application from "../Application";
import * as THREE from "three"
// import Grid from "./Grid";

export default class World {
   constructor() {
      this.application = new Application()
      this.scene = this.application.scene
      this.resources = this.application.resources
      
      // this.grid = new Grid(10, 10)
      // console.log(this.grid)

      this.resources.on("ready", () => {
         this.prepareAndLoadResources()
      })
   }

   prepareAndLoadResources() {
      console.log(this.resources)
      this.resources.items.planetPrimeBakedTexture.file.flipY = false
      const bakedMaterial = new THREE.MeshBasicMaterial({ map: this.resources.items.planetPrimeBakedTexture.file })
      // bakedMaterial.encoding = THREE.sRGBEncoding
      this.resources.items.planetPrimeModel.file.scene.traverse((child) => {
         child.material = bakedMaterial
      })
      this.scene.add(this.resources.items.planetPrimeModel.file.scene)
   }
}