import Application from "@/Application/Application";
// import * as THREE from "three"
import Grid from "@/Application/World/Objects/Grid";
// import Axes from "../Utils/Axes";
import PlanetPrime from "@/Application/World/Objects/PlanetPrime";
import Airplane from "@/Application/World/Objects/Airplane";
import Satellite from "@/Application/World/Objects/Satellite";

export default class World {
  constructor() {
    this.application = new Application();
    this.scene = this.application.scene;
    this.resources = this.application.resources;
    this.gravityObjects = [];
    this.time = this.application.time;
    this.numberOfObjectsToAdd = 1;

    // this.axes = new Axes(10)

    this.planetPrime = new PlanetPrime();
    this.planetPrime.on("ready", () => {
      this.gravityObjects.push({
        instance: this.planetPrime.instance,
        name: "PlanetPrime",
        gridCurvatureProps: {
          uPowerFactor: 5,
          uWidth: 500,
          uDepth: 11.5,
        },
      });
      this.numberOfObjectsToAdd--;
      if (this.numberOfObjectsToAdd == 0)
        this.grid = new Grid(1000, 500, this.gravityObjects);
    });

    this.airplane = new Airplane();
    this.satellite = new Satellite();
  }
}
