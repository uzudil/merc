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
		this.power = 0;
		this.landing = false;
		this.main = main;
		this.scene = scene;
		this.obj = new THREE.Object3D();
		this.speed = MIN_SPEED;
		let texture = new THREE.TextureLoader().load( "images/particle.png" );
		//texture.anisotropy = main.renderer.getMaxAnisotropy();
		var material = new THREE.SpriteMaterial( { map: texture, color: 0xffff88, fog: false } );
		for(let i = 0; i < COUNT; i++) {

			//var particle = new THREE.Sprite( new THREE.MeshBasicMaterial({ map: texture }) );
			var particle = new THREE.Sprite( material );
			Space.positionStar(particle, 1000);
			this.obj.add( particle );


			//let mesh = new THREE.Mesh(
			//	new THREE.CubeGeometry(1, 1, 1),
			//	new THREE.MeshBasicMaterial({ color: 0xffffff  }));
			//Space.positionStar(mesh, 1000);
			//this.obj.add(mesh);
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

		this.noise = new noise.Noise();
	}

	static positionStar(mesh) {
		let rad = Math.random() * Math.PI * 2;
		// don't put any stars in the middle
		let d = (Math.random() * (SIZE * .9)) + SIZE * .1;
		let x = d * Math.cos(rad);
		let y = d * Math.sin(rad);
		mesh.position.set(x, y, -(DEPTH*.5 + Math.random() * DEPTH*.5));
		let s = 1 - mesh.position.z / -DEPTH + 1;
		mesh.scale.set(s, s, s);
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
				this.endSpace();
			}
		}

		if(this.power == 0) {
			this.noise.stop("pink");
		} else {
			this.noise.setLevel("pink", this.power > 0 ? .5 * this.power : -this.power);
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
		this.targ = new THREE.Mesh(new THREE.SphereGeometry(DEPTH * 2),
			new THREE.MeshBasicMaterial({color: "rgb(39,79,6)", side: THREE.DoubleSide, depthTest: false, depthWrite: false}));
		this.targ.position.z = -DEPTH;
		this.scene.add(this.targ);
	}
}