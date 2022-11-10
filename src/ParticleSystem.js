import { Vector3, BufferAttribute } from "three"
import Particle from "./Particle"

export default class ParticleSystem {
    constructor() {
        this.particles = []
        this.geometry = null
        this.material = null
        this.points = null
        this.attractor = new Vector3()
        this.parameters = null
        this.sizes = {
            width: 8,
            height: 4,
            depth:1
        }

    }

    setPoints(points) {
        this.points = points
        const positions = this.points.geometry.attributes.position
        for(let i = 0; i < positions.count; i++) {
            const p = new Particle(i)
            this.particles.push(p)
        }
    }

    update() {
        const geometry = this.points.geometry
        const positions = geometry.attributes.position
        this.particles.map((p) => {
            // p.checkEdges(this.sizes)
            // p.flock(this.particles)
            const f = p.calculateAttractionTo(this.attractor)
            p.applyForce(f)
            p.update()
            positions.setXYZ(
                p.index,
                p.location.x,
                p.location.y,
                p.location.z
            )
        })
        positions.needsUpdate = true
    }
}