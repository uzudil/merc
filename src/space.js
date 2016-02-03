import THREE from 'three.js';
import * as noise from 'noise'

const SIZE = 100;
const DEPTH = 100;
const COUNT = 500;
const MAX_SPEED = 2.7;
const MIN_SPEED = 0.1;

export class Space {
	constructor(scene, main) {
		this.power = 0;
		this.landing = false;
		this.main = main;
		this.scene = scene;
		this.obj = new THREE.Object3D();
		this.speed = MIN_SPEED;
		for(let i = 0; i < COUNT; i++) {
			let mesh = new THREE.Mesh(
				new THREE.CubeGeometry(1, 1, 1),
				new THREE.MeshBasicMaterial({ color: 0xffffff  }));
			Space.positionStar(mesh, 1000);
			this.obj.add(mesh);
		}
		this.scene.add(this.obj);

		for(let i = 0; i < 1000; i++) {
			for (let mesh of this.obj.children) {
				mesh.position.z += MAX_SPEED;
			}
		}
		for (let mesh of this.obj.children) {
			if(mesh.position.z >= 0) {
				Space.positionStar(mesh);
			}
		}

		var ac = new AudioContext();
		this.noise = new noise.Noise(ac);
		this.noise.setEnabled(true);
		this.noise.setMode("pink");
		this.noise.start();
	}

	static positionStar(mesh) {
		let rad = Math.random() * Math.PI * 2;
		// don't put any stars in the middle
		let d = (Math.random() * (SIZE * .9)) + SIZE * .1;
		let x = d * Math.cos(rad);
		let y = d * Math.sin(rad);
		mesh.position.set(x, y, -(DEPTH*.5 + Math.random() * DEPTH*.5));
		let s = 1 - mesh.position.z / -DEPTH;
		mesh.scale.set(s, s, s);
	}

	getSpeed() {
		return (this.speed/MAX_SPEED * 50000)|0;
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;
		this.prevTime = time;

		if(this.power > 0) {
			if (this.speed < MAX_SPEED) {
				this.speed *= 1.025;
			} else {
				this.speed = MAX_SPEED;
				this.power = 0;
			}
		} else if(this.power < 0) {
			if(this.speed > MIN_SPEED) {
				this.speed *= .98;
			} else {
				this.speed = MIN_SPEED;
				this.power = 0;
				this.startLanding();
			}
		}

		for (let mesh of this.obj.children) {
			mesh.position.z += this.speed;
			if (mesh.position.z >= 0) {
				Space.positionStar(mesh);
			}
		}

		if(this.landing) {
			this.targ.position.z += delta * 2;
			//console.log("delta=" + delta + " z=" + this.targ.position.z);
			let s = 1 - this.targ.position.z / -DEPTH;
			this.targ.scale.set(s, s, s);
			if(this.targ.position.z > -DEPTH * .67) {
				this.landing = false;
				this.speed = 0;
				this.power = 0;
				this.scene.remove(this.obj);
				this.scene.remove(this.targ);
				this.main.startGame();
			}
		}

		if(this.power != 0) {
			this.noise.start();
		} else {
			this.noise.stop();
		}
		this.noise.setLevel(this.power > 0 ? .5 * this.power : -this.power);
	}

	startLanding() {
		this.landing = true;
		this.targ = new THREE.Mesh(new THREE.SphereGeometry(DEPTH * 2),
			new THREE.MeshBasicMaterial({color: "rgb(39,79,6)", side: THREE.doubleSided, depthTest: false, depthWrite: false}));
		this.targ.position.z = -DEPTH;
		this.scene.add(this.targ);
	}
}