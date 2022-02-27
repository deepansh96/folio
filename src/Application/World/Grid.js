import * as THREE from "three"
import Application from "../Application"
import vertexShader from "../shaders/grid/vertex.glsl"
import fragmentShader from "../shaders/grid/fragment.glsl"

export default class Grid {
   constructor(size, divisons) {
      this.application = new Application()
      this.scene = this.application.scene
      this.setupDebugUI(size, divisons)
      this.createGrid()
   }

   setupDebugUI(size, divisons) {
      this.debug = this.application.debug
      if (this.debug.active) this.debugFolder = this.debug.ui.addFolder('Grid')
      
      this.debugObject = {
         size,
         divisons,
      }
      this.debugFolder.add(this.debugObject, 'size').name('size').min(10).max(10000).step(1).onChange(() => this.createGrid())
      this.debugFolder.add(this.debugObject, 'divisons').name('divisons').min(10).max(10000).step(1).onChange(() => this.createGrid())
   }

   createGrid() {
      if (this.instance != null) {
         this.instance.geometry.dispose()
         this.instance.material.dispose()
         this.scene.remove(this.instance)
         this.instance = null
      }

      this.instance = new THREE.GridHelper(this.debugObject.size, this.debugObject.divisons, 'white', 'white')
      console.log(this.instance)
      
      const shaderMaterial = new THREE.RawShaderMaterial({
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      })
      this.instance.material = shaderMaterial
      console.log(this.instance)
      
      this.scene.add(this.instance)
   }
}