import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import glb from './assets/glb.glb'
import helveticaJSON from 'three/examples/fonts/helvetiker_bold.typeface.json'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

const dracoLoader = new DRACOLoader()

// set up a renderer
const renderer = new THREE.WebGLRenderer({
	antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
// THREE colors look like 0xff00ff, same as #ff00ff
renderer.setClearColor(0xEEB79F, 1)

// find the element to add the renderer to!
const section = document.querySelector("section")
section.appendChild(renderer.domElement)

// lets create a scene
const scene = new THREE.Scene()

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader)

let loadedGlb = null
loader.load(glb, (gltf) => 		{ loadedGlb = gltf.scene; loadedGlb.scale.set(10,10,10) })

// lets create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.z = -50
camera.lookAt(scene.position)

// lets add some lighting
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, -1)
scene.add(light)

// hold some data about the shapes being added
const shapes = []

// lets add in an animation loop
const animate = function () {
	renderer.render(scene, camera)
	requestAnimationFrame(animate)

	camera.position.setZ(camera.position.z + 1)

	// lets rotate the shapes each frame
	shapes.forEach(shape => {
		shape.rotateX(-0.005)
	})
}

// start the animation
animate()

const createText = (text) => {
	const colors = [ 0xBB55FE, 0x8383e1, 0x83d3e1]
	const randNumber = Math.floor(Math.random() * colors.length)
	const geometry = new THREE.TextGeometry(text, {
		font: new THREE.Font(helveticaJSON),
		size:40,
		height:5,
		curveSegment:12,
		bevelEnabled:false
	})
	const emissiveColor = new THREE.Color("hsl(" + hue + ", 100%, 50%)")
	const material = new THREE.MeshLambertMaterial({
		//color:0xffffff,
	  color: colors[randNumber],
	  emissive: colors[randNumber],
	  emissiveIntensity:0.2
	})
	
	const shape = new THREE.Mesh(geometry, material)
	shape.rotateZ(Math.PI/Math.random())
	shape.rotateY(Math.PI/2)	
	return shape;
}

// lets make a function that creates a shape
const createShape = function (x, y) {

	shapes.push(shape) 
	scene.add(shape)
}

document.addEventListener("mousedown", function (event) {
	createShape(event.pageX, event.pageY)
})

document.addEventListener("touchstart", function (event) {
    createShape(event.pageX, event.pageY)
})

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})