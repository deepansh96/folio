import Application from "../Application";
import * as THREE from "three"

export default class World {
   constructor() {
      this.application = new Application()
      this.scene = this.application.scene

      const testMesh = new THREE.Mesh(
         new THREE.BoxGeometry(1, 1, 1),
         new THREE.MeshNormalMaterial()
      )
      this.scene.add(testMesh)
   }
}