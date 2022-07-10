import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as Tone from 'tone';
import * as dat from 'dat.gui'
import CanvasRecorder from './CanvasRecorder';
import {CinematicCamera} from 'three/examples/jsm/cameras/CinematicCamera'

let playing = false

const soundUrl = require('url:../assets/20220512-sessions.mp3');
const player = new Tone.Player(soundUrl).toDestination()

Tone.loaded().then(() => {
    playOverlay.innerHTML="<p>play</p>"
    playOverlay.addEventListener("click", startPlayer)
})

const startPlayer = async () => {
	playOverlay.style.visibility = "hidden"
    player.start(0)
	playing = true
}

const playOverlay = document.getElementById("overlay")

const recorder = new Tone.Recorder()
player.connect(recorder)

const resolution = 512

const fft = new Tone.FFT(resolution)
player.connect(fft)

const gui = new dat.GUI()

gui.hide()


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
gui.add(clear,'clear');

// set up a renderer
const renderer = new THREE.WebGLRenderer({
	antialias: false
})
renderer.setSize(500,500)
//renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
// THREE colors look like 0xff00ff, same as #ff00ff
renderer.setClearColor(0xefefef, 1)

// find the element to add the renderer to!
const section = document.querySelector("section")
section.appendChild(renderer.domElement)

// lets create a scene
const scene = new THREE.Scene()


// lets create a camera
//const camera = new THREE.PerspectiveCamera(15, 1000/1000, 0.1, 10000)
const camera = new CinematicCamera(60,1,0.1,10000)

//const controls = new OrbitControls(camera,renderer.domElement)
//controls.enableDamping = true

camera.setLens(120)
camera.position.set(
    108.03713409632925,
    58.707313404716785,
    189.80345409376739
)
camera.rotation.set(
    -0.390323859604716,
    0.33955794719270255,
    0.13618803798938953
)
camera.updateProjectionMatrix()

const saveCameraLocation = () => {
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
}

//camera.lookAt(resolution/2,0,0)

// lets add some lighting
// const light = new THREE.DirectionalLight(0xffffff, 1)
// light.position.set(0, 0, -1)
// scene.add(light)

const videorecorder = new CanvasRecorder(renderer.domElement,gui,"samp.mp4",recorder)

// lets add in an animation loop

let curves = []

const curveMaterial = new THREE.LineBasicMaterial({
    color:0x3366ff,
    transparent:true,
    opacity:0.3,
})

const animate = function () {
	requestAnimationFrame(animate)
    if(playing) {
        const values = fft.getValue()
	    let vectors = []
        for(let i=0;i<resolution;i++) {
            vectors.push(new THREE.Vector3(
                i*0.5,
                values[i]*0.5,
                0
            ))
        }
        const curve = new THREE.CatmullRomCurve3(vectors)
        const points = curve.getPoints(resolution)
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const curveMesh = new THREE.Line(curveGeometry,curveMaterial.clone())
        curves.push(curveMesh)
        // tick = tick - 1
        scene.add(curveMesh)

        
        for(const curve of curves) {
            curve.position.setZ(curve.position.z-0.1)
            curve.material.opacity = curve.material.opacity - 0.0002
            curve.material.color.r = curve.material.color.r + 0.001
            curve.material.color.g = curve.material.color.g - 0.001
            curve.material.color 
            if(curve.material.opacity <= 0.0) {
                curve.geometry.dispose()
                scene.remove(curve)
            }
        }
	}

	renderer.render(scene, camera)
    //controls.update()
}

// start the animation
animate()

document.addEventListener("touchstart", function (event) {
    
})

window.addEventListener("keydown", (e) => {
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
})