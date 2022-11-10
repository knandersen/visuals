import { Vector3, BufferAttribute, BufferGeometry } from "three"

export default class Particle {
    constructor(i) {
        // this.velocity = new Vector3(0.001, 0.001, 0.001)
        this.velocity = new Vector3()
        this.acceleration = new Vector3()
        this.location = new Vector3(Math.random()-0.5,0,Math.random()-0.5)

        this.index = i
        this.r = .5;
        this.maxSpeed = 0.1;
        this.maxForce = 0.2;
        this.mass = 500;
        this.attractionFactor = 0.0005;

        this.min = new Vector3(-1,-1,-1);
        this.max = new Vector3(1,1,1);
    }

    align(particles) {
        const neighborDist = .8;
        const alignSteer = new Vector3()
        let count = 0;

        for(let i = 0; i < particles.length; i++) {
            const d = this.location.distanceTo(particles[i].location)
            if((d > 0) && (d < neighborDist)) {
                alignSteer.add(particles[i].velocity)
                count++;
            }
        }
        if(count > 0) {
            alignSteer.divideScalar(count)
            alignSteer.normalize()
            alignSteer.multiplyScalar(this.maxSpeed)

            const steer = alignSteer.sub(this.velocity)

            return steer;
        } else {
            return new Vector3()
        }
    }

    applyForce(force) {
        const f = force.divideScalar(this.mass)
        this.acceleration.add(f)
    }

    calculateAttractionTo(point) {
        const tempPos = this.location.clone()
        const force = tempPos.sub(point)
        const distance = Math.max(force.length()+0.1,30)

        force.normalize()
        const strength = (this.attractionFactor * this.mass*this.mass) / (distance*distance)

        force.multiplyScalar(-strength)
        return force
    }

    checkEdges(sizes) {
        if(this.location.x > sizes.width / 2) {
            this.location.x = sizes.width / 2
            this.velocity.x *= -1;
        } else if(this.location.x < - sizes.width / 2) {
            this.location.x = - sizes.width / 2;
            this.velocity.x *= -1;
        }

        if(this.location.y > sizes.depth / 2) {
            this.location.y = sizes.depth / 2
            this.velocity.y *= -1;
        } else if(this.location.y < - sizes.depth / 2) {
            this.location.y = - sizes.depth / 2;
            this.velocity.y *= -1;
        }

        // this.location.y = 0
        
        if(this.location.z > sizes.height / 2) {
            this.location.z = sizes.height / 2
            this.velocity.z *= -1;
        } else if(this.location.z < - sizes.height / 2) {
            this.location.z = - sizes.height / 2;
            this.velocity.z *= -1;
        }        
    }

    cohesion(particles) {
        const neighborDist = 0.3;
        const cohesionSteer = new Vector3()
        let count = 0;

        for(let i = 0; i < particles.length; i++) {
            const d = this.location.distanceTo(particles[i].location)
            count++
        }

        if(count > 0) {
            cohesionSteer.divideScalar(count)
            return this.seek(cohesionSteer)
        } else {
            return new Vector3()
        }
    }

    flock(particles) {
        const sep = this.separate(particles)
        const ali = this.align(particles)
        const coh = this.cohesion(particles)

        sep.multiplyScalar(1.5)
        ali.multiplyScalar(1.0)
        coh.multiplyScalar(1.0)

        this.applyForce(sep)
        this.applyForce(ali)
        this.applyForce(coh)
    }

    update() {
        this.velocity.add(this.acceleration)
        this.velocity.clamp(this.min,this.max)
        this.location.add(this.velocity)
        this.acceleration.multiplyScalar(0)
    }

    seek(target) {
        const tgt = target.clone()
        const desired = tgt.sub(this.location)

        desired.normalize()
        desired.multiplyScalar(this.maxSpeed)
        const des = desired.clone()

        const steer = des.sub(this.velocity)

        return steer
    }


    separate(particles) {
        const desiredSeparation = this.r * 2;
        const steer = new Vector3()
        let count = 0;

        for(let i = 0; i < particles.count; i++) {
            const d = this.location.distanceTo(particles[i].location)

            if((d > 0) && ( d < desiredSeparation)) {
                const pos = this.location.clone()
                const diff = pos.sub(particles[i].location)
                diff.normalize()
                diff.divideScalar(d)
                steer.add(diff)
                count++;
            }
        }

        if(count > 0) {
            steer.divideScalar(count)
        }

        if(steer.length > 0) {
            steer.normalize()

            steer.multiplyScalar(this.maxSpeed)
            steer.sub(this.velocity)
        }
        return steer;
    }
}