import THREE from 'three.js';
import * as noise from 'noise'

const SIZE = 100;
const DEPTH = 100;
const COUNT = 500;
const MAX_SPEED = 2.7;
const MIN_SPEED = 0.1;

var programStroke = function ( context ) {
	context.lineWidth = 0.025;
	context.beginPath();
	context.arc( 0, 0, 0.5, 0, PI2, true );
	context.stroke();
};

export class Space {
	constructor(scene, main) {
		this.prevTime = Date.now();
		this.power = 0;
		this.powerStart = null;
		this.burnTime = 0;
		this.landing = false;
		this.main = main;
		this.scene = scene;
		this.obj = new THREE.Object3D();
		this.speed = MIN_SPEED;
		for(let i = 0; i < COUNT; i++) {
			let mesh = new THREE.Mesh(
				new THREE.CubeGeometry(1, 1, 1),
				new THREE.MeshBasicMaterial({ color: 0xffff88  }));
			Space.positionStar(mesh);
			this.obj.add(mesh);
		}
		this.scene.add(this.obj);

		for(let i = 0; i < 5000; i++) {
			for (let mesh of this.obj.children) {
				Space.moveStar(mesh, MAX_SPEED);
			}
		}

		this.noise = new noise.Noise();
	}

	burn(dir, time) {
		this.power = dir;
		this.powerStart = Date.now();
		this.burnTime = time;
	}

	static positionStar(mesh) {
		let rad = Math.random() * Math.PI * 2;
		// don't put any stars in the middle
		let d = (Math.random() * (SIZE * .9)) + SIZE * .1;
		let x = d * Math.cos(rad);
		let y = d * Math.sin(rad);
		mesh.position.set(x, y, -(DEPTH*.75 + Math.random() * DEPTH*.25));
		mesh.scale.set(0.01, 0.01, 0.01);
	}

	getSpeed() {
		return (this.speed/MAX_SPEED * 50000)|0;
	}

	abort() {
		this.endSpace(true);
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;
		this.prevTime = time;

		if(this.power > 0) {
			if(time - this.powerStart < this.burnTime) {
				this.speed = ((time - this.powerStart) / this.burnTime) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
			} else {
				this.speed = MAX_SPEED;
				this.power = 0;
			}
		} else if(this.power < 0) {
			if(time - this.powerStart < this.burnTime) {
				this.speed = (1 - (time - this.powerStart) / this.burnTime) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
			} else {
				this.speed = MIN_SPEED;
				this.power = 0;
				this.startLanding();
			}
		}

		//console.log(15 * delta);
		for (let mesh of this.obj.children) {
			// delta is 1/FPS, w. max 60 FPS
			// this was originally written for 15fps...
			Space.moveStar(mesh, (this.speed * (15 * delta)));
		}

		if(this.landing) {
			let p = (time - this.landingStart) / 15000;
			let s = p * 17 + 0.1;
			this.targ.scale.set(s, s, s);
			if(p >= 1) {
				this.endSpace();
			}
		}

		if(this.power == 0) {
			this.noise.stop("pink");
		} else {
			this.noise.setLevel("pink", this.power > 0 ? .5 * this.power : -this.power);
		}
	}

	static moveStar(mesh, dz) {
		mesh.position.z += dz;
		let s = (1 - (mesh.position.z / -DEPTH)) * .5;
		mesh.scale.set(s, s, s);
		if(mesh.position.z >= 0) {
			Space.positionStar(mesh);
		}
	}

	endSpace(skipLanding) {
		console.log("space ending");
		this.landing = false;
		this.speed = 0;
		this.power = 0;
		if(this.obj) this.scene.remove(this.obj);
		if(this.targ) this.scene.remove(this.targ);
		this.noise.stop("pink");
		this.main.startGame(skipLanding);
	}

	startLanding() {
		this.landing = true;
		this.landingStart = Date.now();
		this.targ = new THREE.Mesh(new THREE.SphereGeometry(1),
			new THREE.MeshBasicMaterial({color: "rgb(39,79,6)", side: THREE.DoubleSide, depthTest: false, depthWrite: false}));
		this.targ.position.z = -20;
		this.scene.add(this.targ);
	}
}