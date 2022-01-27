<template>
  <canvas id="webgl-canvas" class="fixed top-0 left-0 outline-0"></canvas>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
</template>

<script>
import Application from "@/Application/Application.js"

let app;

export default {
  name: 'App',
  components: {
  },
  created() {
    this.$nextTick(() => {
      app = new Application({
        canvas: document.getElementById('webgl-canvas')
      })
      console.log(app)
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

* {
  margin: 0;
  padding: 0;
}

html,
body {
  overflow: visible;
  background: #1e1a20;
}
</style>
