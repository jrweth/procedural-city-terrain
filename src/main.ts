import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import TerrainPlane from './geometry/TerrainPlane';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {Terrain} from "./generated-elements/terrain";
import Roads from "./generated-elements/road/roads";
import RoadSegments from "./geometry/RoadSegments";

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Show Roads': true,
  'Show Population Density': true,
  'Show Buildings': true,
  'Show Build Sites': true,

  'Elevation Seed': 89.3943,
  'Population Seed': 1.234,

  'Road Seed': 5.43,
  'Highway Segment Length': 8,
  'Highway Iterations': 3,
  'Highway Max Turn Angle': Math.PI / 18,
  'Street Segment Length': 12,
  'Street Iterations': 3,

  'Num Buildings': 1000,
  'Load Scene': loadScene, // A function pointer, essentially
};
// Add controls to the gui
const gui = new DAT.GUI();
gui.width = 320;


let terrain: Terrain;
let square: Square;
let cube: Cube;
let plane : TerrainPlane;
let roadSegments: RoadSegments;
let wPressed: boolean;
let aPressed: boolean;
let sPressed: boolean;
let dPressed: boolean;
let planePos: vec2;

function loadScene() {

  //initialize terrain
  terrain = new Terrain();
  terrain.elevationSeed = vec2.fromValues(2.0, controls["Elevation Seed"]);
  terrain.populationSeed = vec2.fromValues(1.2, controls["Population Seed"]);
  terrain.roadSeed = controls["Road Seed"];
  terrain.highwayIterations = controls["Highway Iterations"];
  terrain.highwayMaxTurnAngle = controls["Highway Max Turn Angle"];
  terrain.highwaySegmentLength = controls["Highway Segment Length"];
  terrain.streetSegmentLength = controls["Street Segment Length"];
  terrain.streetIterations = controls["Street Iterations"];
  terrain.numBuildings = controls["Num Buildings"];
  terrain.init();

  //create the plane geometry
  plane = new TerrainPlane(terrain);
  plane.create();

  //create the road geometry
  roadSegments = new RoadSegments({
    gridSize: terrain.gridSize,
    scale: plane.scale}
  );
  roadSegments.create();
  roadSegments.setInstanceVBOs(terrain.roads.segments, terrain.roads.intersections);

  //create the building geometry
  cube = new Cube({
    gridSize: terrain.gridSize,
    scale: plane.scale
  });
  cube.create();
  cube.setInstanceVBOs(terrain.buildings);

  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

  wPressed = false;
  aPressed = false;
  sPressed = false;
  dPressed = false;
  planePos = vec2.fromValues(0,0);
}

/**
 * Initialize the Seed Controls
 */
function addTerrainControls() {
  let terrainFolder = gui.addFolder('terrain');
  let eSeed = terrainFolder.add(controls, 'Elevation Seed', {'seed 1': 89.3943, 'seed 2': 5.43, 'seed 3': 8.987, 'seed 4': 1.234}).listen();
  eSeed.onChange(loadScene);
  let pSeed = terrainFolder.add(controls, 'Population Seed', {'seed 1': 1.234, 'seed 2': 5.43, 'seed 3': 8.987, 'seed 4': 43.343}).listen();
  pSeed.onChange(loadScene);

  // mapType.onChange();
}

function getDisplayOptions(): vec4 {
  return vec4.fromValues(
    controls["Show Population Density"] ? 1 : 0,
    controls["Show Build Sites"] ? 1 : 0,
    0,
    0
  );
}

/**
 * Initialize the display controls
 * @param options
 */
function addDisplayControls(options: {
  terrainShader: ShaderProgram;

}) {
  let displayFolder = gui.addFolder('display');
  let showRoads = displayFolder.add(controls, 'Show Roads');
  let showPop = displayFolder.add(controls, 'Show Population Density').listen();
  let showBuildings = displayFolder.add(controls, 'Show Buildings').listen();
  let showBuildSites = displayFolder.add(controls, 'Show Build Sites').listen();
  showPop.onChange(() => {
    options.terrainShader.setDisplayOptions(getDisplayOptions());
  });
  showBuildSites.onChange(() => {
    console.log(getDisplayOptions());
    options.terrainShader.setDisplayOptions(getDisplayOptions());
  })
}

function addRoadControls() {
  let roadFolder = gui.addFolder('roads');
  let rSeed = roadFolder.add(controls, 'Road Seed', {'seed 1': 8.987, 'seed 2': 5.43, 'seed 3': 1.234, 'seed 4': 43.343}).listen();
  let rLength = roadFolder.add(controls, 'Highway Segment Length', [1,2,4, 8, 12, 16, 32]).listen();
  let rIter = roadFolder.add(controls, 'Highway Iterations', [3,4,5]).listen();
  let rAngle = roadFolder.add(controls, 'Highway Max Turn Angle', {
    '2 deg': Math.PI / 90,
    '5 deg': Math.PI / 36,
    '10 deg': Math.PI / 18,
    '15 deg': Math.PI / 12,
    '20 deg': Math.PI / 9,
    '30 deg': Math.PI / 6,
    '45 deg': Math.PI / 4
  }).listen();

  let sIter = roadFolder.add(controls, 'Street Iterations', [3,4,5,6,7]).listen();
  let sLength = roadFolder.add(controls, 'Street Segment Length', [2 ,4, 8, 12, 16]).listen();

  rSeed.onChange(loadScene);
  rLength.onChange(loadScene);
  rIter.onChange(loadScene);
  rAngle.onChange(loadScene);
  sIter.onChange(loadScene);
  sLength.onChange(loadScene);
}



function addBuildingControls() {
  let buildingFolder = gui.addFolder('building');
  let eSeed = buildingFolder.add(controls, 'Num Buildings', [10,100,1000, 2000, 4000]).listen();
  eSeed.onChange(loadScene);

  // mapType.onChange();
}


function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
      case 'w':
      wPressed = true;
      break;
      case 'a':
      aPressed = true;
      break;
      case 's':
      sPressed = true;
      break;
      case 'd':
      dPressed = true;
      break;
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      case 'w':
      wPressed = false;
      break;
      case 'a':
      aPressed = false;
      break;
      case 's':
      sPressed = false;
      break;
      case 'd':
      dPressed = false;
      break;
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);



  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 10, -20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const terrainShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/terrain-frag.glsl')),
  ]);

  const roadShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/roads-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/roads-frag.glsl')),
  ]);

  const buildingShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/buildings-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/buildings-frag.glsl')),
  ]);

  terrainShader.setDisplayOptions(getDisplayOptions());

  //add all the controls
  addDisplayControls({terrainShader: terrainShader});
  addTerrainControls();
  addRoadControls();
  addBuildingControls();

  /**
   * more control stuff
   */


  function processKeyPresses() {
    let velocity: vec3 = vec3.fromValues(0,0, 0);
    if(wPressed) {
      velocity[2] += 1.0;
    }
    if(aPressed) {
      velocity[0] += 1.0;
    }
    if(sPressed) {
      velocity[2] -= 1.0;
    }
    if(dPressed) {
      velocity[0] -= 1.0;
    }
    camera.pan(velocity);

  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    processKeyPresses();
    renderer.render(camera, terrainShader, [
      plane
    ]);
    if(controls["Show Roads"]) {
      renderer.render(camera, roadShader, [roadSegments]);
    }
    if(controls["Show Buildings"]) {
      renderer.render(camera, buildingShader, [cube]);
    }
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
