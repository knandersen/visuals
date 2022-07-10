import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as Tone from 'tone';
import * as dat from 'dat.gui'
import CanvasRecorder from './CanvasRecorder';

const soundUrl = require('url:../assets/20220424.mp3');
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

const fft = new Tone.FFT(16384)
player.connect(fft)

const gui = new dat.GUI()
gui.hide()

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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.z = -40
camera.position.y = 14
camera.lookAt(scene.position)

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
const ringGeometry = new THREE.RingBufferGeometry(20,20,600)
const ringMaterial = new THREE.MeshBasicMaterial({
	color:0xff6600,
	side: THREE.DoubleSide
})
ringGeometry.rotateX(Math.PI/2)
const ringMesh = new THREE.Mesh(ringGeometry,ringMaterial)
// scene.add(ringMesh)

const testGeometry = new THREE.BoxGeometry(10,10,10)
const testMesh = new THREE.Mesh(testGeometry,ringMaterial)
//scene.add(testMesh)


// material
const particlesMaterial = new THREE.PointsMaterial({
	//color:0x333333,
	color:0x333333,
	size: 0.2,
	sizeAttenuation: true
})

const particles = new THREE.Points(ringGeometry,particlesMaterial)
scene.add(particles)
console.log(particles);


// hold some data about the shapes being added
const shapes = []

// lets add in an animation loop

const clock = new THREE.Clock()


const animate = function () {
	requestAnimationFrame(animate)
	if(playing) {
		let positions = particles.geometry.attributes.position
		const values = fft.getValue()
		for(var i = 0; i<positions.array.length;i++) {
			const i3 = i*3;
			//positions[i*3] = values[i];
			// console.log(i);
			positions.array[i3+1] = 10+values[i]*0.1
		}
		//particles.geometry.setAttribute('position',positions)		
		positions.needsUpdate = true
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