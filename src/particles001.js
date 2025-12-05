import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as Tone from 'tone';
import * as dat from 'dat.gui'
import CanvasRecorder from './CanvasRecorder';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import particlesVert from '../shaders/particles.vert'
import particlesFrag from '../shaders/particles.frag'
import ParticleSystem from './ParticleSystem'
import { Vector3 } from 'three';
import { MeshStandardMaterial } from 'three';
import soundUrl from '../assets/20220512-sessions.mp3';

let playing = false

// const soundUrl = require('url:../assets/20220512-sessions.mp3');
const player = new Tone.Player(soundUrl).toDestination()

const glbUrl = new URL('../assets/logosurfaces.glb', import.meta.url)

const gltfLoader = new GLTFLoader()



/* Tone.loaded().then(() => {
    playOverlay.innerHTML="<p>play</p>"
    playOverlay.addEventListener("click", startPlayer)
})

const startPlayer = async () => {
    playOverlay.style.visibility = "hidden"
    player.start(0)
    playing = true
}

const playOverlay = document.getElementById("overlay")
playOverlay.style.visibility = "hidden" */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const recorder = new Tone.Recorder()
player.connect(recorder)

const resolution = 512

const fft = new Tone.FFT(resolution)
player.connect(fft)

const gui = new dat.GUI()

// gui.hide()
/* 
var obj2 = { savestate:function(){
    controls.saveState()
    //setPos()
}}

var clear = { clear: () => {
    scene.clear()
    player.stop()
    playing=false
    curves = []
}}

//gui.add(obj,'add');
gui.add(obj2,'savestate');
gui.add(clear,'clear'); */

// set up a renderer
const renderer = new THREE.WebGLRenderer({
    antialias: false
})
renderer.setSize(window.innerWidth, window.innerHeight)
//renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
// THREE colors look like 0xff00ff, same as #ff00ff
renderer.setClearColor(0x000000, 1)

// find the element to add the renderer to!
const section = document.querySelector("section")
section.appendChild(renderer.domElement)

// lets create a scene
const scene = new THREE.Scene()


// lets create a camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 3
camera.position.z = 0// const camera = new CinematicCamera(60,window.innerWidth/window.innerHeight,0.1,10000)
camera.lookAt(scene.position)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Logo

const logoMaterial = new MeshStandardMaterial({
    color: 0x000000,
    side: THREE.DoubleSide
})

gltfLoader.load(glbUrl.href, (glb) => {
    console.log(glb);
    const loadedGlb = glb.scene
    const s = 0.02
    loadedGlb.scale.set(s, s, s)
    loadedGlb.position.set(0, .1, 0)
    loadedGlb.children[0].material = logoMaterial

    scene.add(loadedGlb)
})

// Particles

const parameters = {}
parameters.count = 10000
parameters.size = 5
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.5
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.mass = 100
parameters.min = -1
parameters.max = 1
parameters.attractionFactor = 0.00005

let geometry = null
let material = null
let ps = null
let points = null

const generateGalaxy = () => {
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    ps = new ParticleSystem()
    ps.parameters = parameters
    // ps.sizes = sizes

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const randomX = Math.random() * sizes.width - sizes.width / 2
        const randomY = 0
        const randomZ = Math.random() * sizes.height - sizes.height / 2

        positions[i3] = randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        fragmentShader: particlesFrag,
        vertexShader: particlesVert,
        uniforms: {
            uSize: { value: 160 }
        },
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })



    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    ps.setPoints(points)
    scene.add(points)
}

generateGalaxy()

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

const updateParticles = () => {
    for (let i = 0; i < ps.particles.length; i++) {
        ps.particles[i].mass = parameters.mass
        ps.particles[i].min = new THREE.Vector3().setScalar(parameters.min)
        ps.particles[i].max = new THREE.Vector3().setScalar(parameters.max)
        ps.particles[i].attractionFactor = parameters.attractionFactor
    }
}

gui.add(parameters, 'mass').min(1).max(1000).step(1).onFinishChange(updateParticles)
gui.add(parameters, 'min').min(-5).max(-0.1).step(.1).onFinishChange(updateParticles)
gui.add(parameters, 'max').min(0.1).max(5).step(.1).onFinishChange(updateParticles)
gui.add(parameters, 'attractionFactor').min(0.0000005).max(0.5).step(.00001).onFinishChange(updateParticles)

// camera.updateProjectionMatrix()

/* const saveCameraLocation = () => {
    localStorage.setItem("camera.position.x", camera.position.x)
    localStorage.setItem("camera.position.y", camera.position.y)
    localStorage.setItem("camera.position.z", camera.position.z)

    localStorage.setItem("camera.rotation.x", camera.rotation.x)
    localStorage.setItem("camera.rotation.y", camera.rotation.y)
    localStorage.setItem("camera.rotation.z", camera.rotation.z)
}

const loadCameraLocation = () => {
    camera.position.x = parseFloat(localStorage.getItem("camera.position.x"));
    camera.position.y = parseFloat(localStorage.getItem("camera.position.y"));
    camera.position.z = parseFloat(localStorage.getItem("camera.position.z"));
    
    camera.rotation.x = parseFloat(localStorage.getItem("camera.rotation.x"));
    camera.rotation.y = parseFloat(localStorage.getItem("camera.rotation.y"));
    camera.rotation.z = parseFloat(localStorage.getItem("camera.rotation.z"));
    camera.updateProjectionMatrix();
    //controls.reset()
    console.log("camera loaded");
}

const printCameraLocation = () => {
    console.log(parseFloat(localStorage.getItem("camera.position.x")))
    console.log(parseFloat(localStorage.getItem("camera.position.y")))
    console.log(parseFloat(localStorage.getItem("camera.position.z")))

    console.log(parseFloat(localStorage.getItem("camera.rotation.x")))
    console.log(parseFloat(localStorage.getItem("camera.rotation.y")))
    console.log(parseFloat(localStorage.getItem("camera.rotation.z")))
} */

//camera.lookAt(resolution/2,0,0)

// lets add some lighting
const light = new THREE.DirectionalLight(0xffffff, 1)
// light.position.set(0, 0, -1)
scene.add(light)

const videorecorder = new CanvasRecorder(renderer.domElement, gui, "samp.mp4", recorder)


const animate = function () {
    requestAnimationFrame(animate)
    if (playing) {
        const values = fft.getValue()
    }
    ps.update()
    renderer.render(scene, camera)
    controls.update()
}

// start the animation
animate()


window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/* window.addEventListener("keydown", (e) => {
    switch(e.key) {
        case "s":
            saveCameraLocation()
            break;
        case "l":
            loadCameraLocation()
            break;
        case "p":
            printCameraLocation()
            break;
        case "i":
            console.log(sound);
            break;
    }
}) */