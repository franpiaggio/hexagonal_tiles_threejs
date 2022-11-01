import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { createMap, createMesh } from './geos';

window.$fxhashFeatures = {
  "test": ""
}

/*
* Init and configs
*/
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const clock = new THREE.Clock()
let preview = true
let RenderTargetClass = null;
let effectComposer;
let elapsedTime = clock.getElapsedTime()
let camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-17,31,20);
scene.add(camera)
const controls = new OrbitControls(camera, canvas)
controls.target.set(0,0,0)
controls.damplingFactor = 0.005
controls.enableDamping = true
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  preserveDrawingBuffer: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
  RenderTargetClass = THREE.WebGLRenderTarget
} else {
  RenderTargetClass = THREE.WebGLRenderTarget
}

const targetConfig = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
}

const renderTarget = new RenderTargetClass(1920, 1080, targetConfig)
effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 100)
bloomPass.enabled = false
bloomPass.strength = 0.01
bloomPass.radius = 0.5
bloomPass.threshold = 0.5
effectComposer.addPass(bloomPass)

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass()
  effectComposer.addPass(smaaPass)
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  effectComposer.setSize(sizes.width, sizes.height)
})

const ambient = new THREE.AmbientLight(0xffffff)
// scene.add(ambient);

const light = new THREE.PointLight( new THREE.Color("#FFCBBE").convertSRGBToLinear().convertSRGBToLinear(), 80, 200 )
light.position.set(10,20,10)
light.castShadow = true
light.shadow.mapSize.width = 1920
light.shadow.mapSize.height = 1920
light.shadow.camera.near = 0.5
light.shadow.camera.far = 500
scene.add(light)


let envmap;
let loadAssetsAndRun = async () => {
  let pmrem = new THREE.PMREMGenerator(renderer)
  let envmapTexture = await new RGBELoader().loadAsync("envmap.hdr")
  envmap = pmrem.fromEquirectangular(envmapTexture).texture
  const geometries = createMap(15,15,10, 16)
  console.log(geometries)
  const mesh = createMesh(envmap, geometries) 
  scene.add(mesh)
  tick();
}

const tick = () => {
  elapsedTime = clock.getElapsedTime()
  controls.update()
  effectComposer.render()

  // light.position.x += Math.sin(elapsedTime * 0.02)

  if (preview && elapsedTime > 1) {
    fxpreview()
    preview = false
  }

  window.requestAnimationFrame(tick)
}

loadAssetsAndRun()


