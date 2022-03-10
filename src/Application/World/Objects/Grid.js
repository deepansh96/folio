import * as THREE from "three"
import Application from "@/Application/Application.js"
import { injectIntoShader } from "@/Application/Utils/Shaders.js"
import injectableVertexShader from "@/Application/InjectableShaders/grid/vertex"
import injectableFragmentShader from "@/Application/InjectableShaders/grid/fragment"

export default class Grid {
   constructor(size, divisons, gravityObjects) {
      this.application = new Application()
      this.debug = this.application.debug
      this.scene = this.application.scene
      this.resources = this.application.resources
      this.instance = null
      this.gravityObjects = gravityObjects
      this.properties = {
         size: size,
         divisons: divisons,
         uPowerFactor: 2.718281828459045,
         uDepth: 1.0,
         uWidth: 1.0,
      }
      
      // this.createGrid()

      this.setGeometry()
      this.setMaterial()
      this.setMesh()

      this.calculateGridCurvature()
      this.setupDebug()
   }

   setGeometry() {
      // dispose off the instance if it already exists
      if (this.instance != null) this.disposeGrid()

      // creating a plane, then playing with the index buffer to create a new geometry
      // then using that to create a LineSegments object (with LineBasicMaterial)
      // source - https://discourse.threejs.org/t/gridboxgeometry/1420

      let planeGeometry = new THREE.BoxBufferGeometry(
         this.properties.size, 
         this.properties.size, 
         0, 
         this.properties.divisons, 
         this.properties.divisons
      )
      this.geometry = this.convertToGridGeometry(planeGeometry, false)

      // copy over the uv attribute from old to new geometry, 
      // as we need those in the fragment shader of this object
      this.geometry.setAttribute('uv', new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2))
   }

   setMaterial() {
      this.material = new THREE.LineBasicMaterial()

      this.customUniforms = {
         uWidthOfUV: {
            value: 0.03,
         },
         uLocationOfUV: {
            value: 0.5,
         }
      }
      
      // update the shaders with custom code
      this.material.onBeforeCompile = (shader) => {
         shader.uniforms.uWidthOfUV = this.customUniforms.uWidthOfUV
         shader.uniforms.uLocationOfUV = this.customUniforms.uLocationOfUV

         shader.vertexShader = injectIntoShader(injectableVertexShader, shader.vertexShader)
         shader.fragmentShader = injectIntoShader(injectableFragmentShader, shader.fragmentShader)
      }

      this.material.side = THREE.DoubleSide
   }

   setMesh() {
      this.instance = new THREE.LineSegments(this.geometry, this.material);
      this.instance.rotation.x -= Math.PI / 2
      // this.instance.material.side = THREE.DoubleSide
      this.scene.add(this.instance)
   }

   reCreateGrid() {      
      this.setGeometry()
      this.setMesh()
   }

   calculateGridCurvature() {
      const count = this.instance.geometry.attributes.position.count
      const displacement = new Float32Array(count)

      this.gravityObjects.forEach((object) => {
         let objectX = object.instance.position.x
         let objectZ = object.instance.position.z
         let objectPowerFactor = ('gridCurvatureProps' in object) 
            ? object.gridCurvatureProps.uPowerFactor
            : this.properties.uPowerFactor
         let objectWidth = ('gridCurvatureProps' in object) 
            ? object.gridCurvatureProps.uWidth
            : this.properties.uWidth
         let objectDepth = ('gridCurvatureProps' in object) 
            ? object.gridCurvatureProps.uDepth
            : this.properties.uDepth

         for (let i = 0; i < count * 3; i += 3) {
            let x = this.instance.geometry.attributes.position.array[i]
            let z = this.instance.geometry.attributes.position.array[i + 1]

            let disp = - (objectDepth) * Math.pow(
               objectPowerFactor, 
               -(
                  (Math.pow(x - objectX, 2.0) * (1.0 / objectWidth))
                     + 
                  (Math.pow(z + objectZ, 2.0) * (1.0 / objectWidth))
               )
            );
            displacement[i / 3] += disp
         }
      })

      this.instance.geometry.setAttribute('aDisplacement', new THREE.BufferAttribute(displacement, 1))


   }

   convertToGridGeometry(geometry, independent) {
      if (!(geometry instanceof THREE.BoxBufferGeometry)) {
        console.log("GridBoxGeometry: the parameter 'geometry' has to be of the type THREE.BoxBufferGeometry");
        return geometry;
      }
      independent = independent !== undefined ? independent : false;
  
      let newGeometry = new THREE.BoxBufferGeometry();
      let position = geometry.attributes.position;
      newGeometry.attributes.position = independent === false ? position : position.clone();
  
      let segmentsX = geometry.parameters.widthSegments || 1;
      let segmentsY = geometry.parameters.heightSegments || 1;
      let segmentsZ = geometry.parameters.depthSegments || 1;
  
      let startIndex = 0;
      let indexSide1 = indexSide(segmentsZ, segmentsY, startIndex);
      startIndex += (segmentsZ + 1) * (segmentsY + 1);
      let indexSide2 = indexSide(segmentsZ, segmentsY, startIndex);
      startIndex += (segmentsZ + 1) * (segmentsY + 1);
      let indexSide3 = indexSide(segmentsX, segmentsZ, startIndex);
      startIndex += (segmentsX + 1) * (segmentsZ + 1);
      let indexSide4 = indexSide(segmentsX, segmentsZ, startIndex);
      startIndex += (segmentsX + 1) * (segmentsZ + 1);
      let indexSide5 = indexSide(segmentsX, segmentsY, startIndex);
      startIndex += (segmentsX + 1) * (segmentsY + 1);
      let indexSide6 = indexSide(segmentsX, segmentsY, startIndex);
  
      let fullIndices = [];
      fullIndices = fullIndices.concat(indexSide1);
      fullIndices = fullIndices.concat(indexSide2);
      fullIndices = fullIndices.concat(indexSide3);
      fullIndices = fullIndices.concat(indexSide4);
      fullIndices = fullIndices.concat(indexSide5);
      fullIndices = fullIndices.concat(indexSide6);
  
      newGeometry.setIndex(fullIndices);
  
      function indexSide(x, y, shift) {
        let indices = [];
        for (let i = 0; i < y + 1; i++) {
          let index11 = 0;
          let index12 = 0;
          for (let j = 0; j < x; j++) {
            index11 = (x + 1) * i + j;
            index12 = index11 + 1;
            let index21 = index11;
            let index22 = index11 + (x + 1);
            indices.push(shift + index11, shift + index12);
            if (index22 < ((x + 1) * (y + 1) - 1)) {
              indices.push(shift + index21, shift + index22);
            }
          }
          if ((index12 + x + 1) <= ((x + 1) * (y + 1) - 1)) {
            indices.push(shift + index12, shift + index12 + x + 1);
          }
        }
        return indices;
      }
      return newGeometry;
   }

   disposeGrid() {
      this.instance.geometry.dispose()
      this.instance.material.dispose()
      this.scene.remove(this.instance)
      this.instance = null
   }

   setupDebug() {
      this.debugObject = {
         size: this.properties.size,
         divisons: this.properties.divisons,
         uPowerFactor: this.properties.uPowerFactor,
         uDepth: this.properties.uDepth,
         uWidth: this.properties.uWidth,
         uWidthOfUV: { value: this.customUniforms.uWidthOfUV.value },
         uLocationOfUV: { value: this.customUniforms.uLocationOfUV.value },
      }

      this.debugFolder = null
      if (this.debug.active)
         this.debugFolder = this.debug.ui.addFolder('Grid')

      if (this.debugFolder != null) {
         this.debugFolder.add(this.debugObject, 'size').name('size').min(10).max(10000).step(1).onFinishChange(() => { this.reCreateGrid(); this.calculateGridCurvature() })
         this.debugFolder.add(this.debugObject, 'divisons').name('divisons').min(10).max(1000).step(1).onFinishChange(() => { this.reCreateGrid(); this.calculateGridCurvature() })
         if (this.instance != null && 'material' in this.instance) {
            this.debugFolder.add(this.debugObject, 'uPowerFactor').min(0).max(10).step(0.0001).name('Power Factor').onChange(() => this.calculateGridCurvature())
            this.debugFolder.add(this.debugObject, 'uDepth').min(0).max(100).step(0.001).name('Depth').onChange(() => this.calculateGridCurvature())
            this.debugFolder.add(this.debugObject, 'uWidth').min(0).max(1000).step(0.001).name('Width').onChange(() => this.calculateGridCurvature())
            this.debugFolder.add(this.debugObject.uWidthOfUV, 'value').min(0).max(1).step(0.001).name('uWidthOfUV').onChange(() => this.customUniforms.uWidthOfUV.value = this.debugObject.uWidthOfUV.value)
            this.debugFolder.add(this.debugObject.uLocationOfUV, 'value').min(0).max(1).step(0.001).name('uLocationOfUV').onChange(() => this.customUniforms.uLocationOfUV.value = this.debugObject.uLocationOfUV.value)
         }
      }
   }
}