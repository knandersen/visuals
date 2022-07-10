import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as Tone from 'tone';
import * as dat from 'dat.gui'
import CanvasRecorder from './CanvasRecorder';
import ringFragment from '../shaders/fragment.frag'
import ringVertex from '../shaders/vertex.vert'
import { LineBasicMaterial } from 'three';

soundUrl = new URL('../assets/20220618-side_a.wav', import.meta.url);

const player = new Tone.Player(soundUrl.href).toDestination()
const recorder = new Tone.Recorder()
player.connect(recorder)

const resolution = 512

const fft = new Tone.FFT(resolution)
player.connect(fft)

const gui = new dat.GUI()

let playing = false

var obj = { add:function(){ 
	player.start(0) 
	playing = true
}};

var obj2 = { sample:function(){
	console.log(fft.getValue())
	//setPos()
}}

gui.add(obj,'add');
gui.add(obj2,'sample');

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
const frustumSize = 100;
//const aspect = window.innerWidth / window.innerHeight;
const aspect = 1;
const camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
camera.position.x = 0
camera.position.z = 0
camera.position.y = 100
camera.lookAt(0,0,0)

const controls = new OrbitControls(camera,renderer.domElement)
controls.enableDamping = true
// lets add some lighting
// const light = new THREE.DirectionalLight(0xffffff, 1)
// light.position.set(0, 0, -1)
// scene.add(light)

const videorecorder = new CanvasRecorder(renderer.domElement,gui,"samp.mp4",recorder)

// fog
const fog = new THREE.FogExp2(0x333333,0.1,5000)
scene.fog = fog

// ring

const circleGeometry = new THREE.CircleGeometry(30,510,0,Math.PI*2)
const circleMaterial = new THREE.ShaderMaterial({
    fragmentShader:ringFragment,
    vertexShader:ringVertex
})
//circleGeometry.rotateX(Math.PI/2)
const circleMesh = new THREE.Mesh(circleGeometry,circleMaterial)
circleMesh.rotation.x = -90
scene.add(circleMesh)
console.log(circleGeometry);

const c = new Float32Array(512).fill(0.0)
circleGeometry.attributes.fft = new THREE.BufferAttribute(c)

// lets add in an animation loop

const clock = new THREE.Clock()

const animate = function () {
	requestAnimationFrame(animate)
	if(playing) {
        circleGeometry.attributes.fft = new THREE.BufferAttribute(fft.getValue())
	}

	// console.log(energies);

	renderer.render(scene, camera)
	controls.update()
}

// start the animation
animate()

document.addEventListener("mousedown", function (event) {
	
})

document.addEventListener("touchstart", function (event) {
    
})

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})