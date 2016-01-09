/**
 * originally from:
 * view-source:http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
 */
import THREE from 'three.js';
import $ from 'jquery';
import * as models from 'model'
import * as util from 'util'
import * as noise from 'noise'

const SIZE = 20;
export const DEFAULT_Z = 20;
const STALL_SPEED = 5000;
const DEBUG = false;

export class Movement {
	constructor(main) {
		this.main = main;

		var ac = new AudioContext();
		this.noise = new noise.Noise(ac);
		this.noise.setEnabled(!DEBUG);
		this.noise.setMode("walk");

		this.prevTime = Date.now();
		this.direction = new THREE.Vector3(0, 1, 0);
		this.rotation = new THREE.Euler(0, 0, 0, "ZXY");

		this.intersections = [];
		this.bbox = new THREE.Box3(new THREE.Vector3(-SIZE, -SIZE, -SIZE), new THREE.Vector3(SIZE, SIZE, SIZE));
		this.model_bbox = new THREE.Box3();

		this.vehicle = null;
		this.speed = 0;

		main.camera.rotation.set( 0, 0, 0 );

		this.pitch = new THREE.Object3D();
		this.pitch.rotation.x = Math.PI / 2;
		this.pitch.add(this.main.camera);

		this.roll = new THREE.Object3D();
		this.roll.add(this.pitch);

		// yaw
		this.player = new THREE.Object3D();
		this.player.add(this.roll);
		this.player.rotation.z = Math.PI;
		this.main.scene.add(this.player);

		this.movementX = 0.0;
		this.movementY = 0.0;

		$(document).mousemove((event) => {
			this.movementX = event.originalEvent.movementX;
			this.movementY = event.originalEvent.movementY;

			if(this.player.position.z > DEFAULT_Z) {
				let p = this.getPitch();
				this.roll.rotation.y += (p >= Math.PI*.5 && p < Math.PI*1.5 ? -1 : 1) * this.movementX * this.getRollSpeed();
			} else {
				this.player.rotation.z -= this.movementX * this.getTurnSpeed();
				this.roll.rotation.y = 0;
			}
			this.pitch.rotation.x += this.movementY * this.getPitchSpeed();
		});

		$(document).keydown(( event ) => {
			switch ( event.keyCode ) {
				case 187: // +
					this.speed = this.speed > 0 ? this.speed * 1.25 : 200;
					if(this.speed > this.getMaxSpeed()) this.speed = this.getMaxSpeed();
					if(this.speed > 0) this.noise.start();
					break;
				case 189: // -
					this.speed = this.speed * .75;
					if(Math.abs(this.speed) < 1) {
						this.speed = 0;
					}
					if(this.speed <= 0) this.noise.stop();
					break;
			}
		});

		$(document).keyup(( event ) => {
			//console.log(event.keyCode);
			switch( event.keyCode ) {
				case 32:
					if(this.vehicle) {
						if(this.player.position.z <= DEFAULT_Z) {
							this.exitVehicle();
						}
					} else {
						this.enterVehicle();
					}
					break;
			}
		});
	}

	exitVehicle() {
		console.log("Exited " + this.vehicle.model.name);
		this.noise.stop();
		this.noise.setMode("walk");
		this.main.game_map.addModelAt(
			this.player.position.x,
			this.player.position.y,
			this.vehicle.model,
			this.player.rotation.z);
		this.vehicle = null;
		this.speed = 0;
	}

	enterVehicle() {
		for(let o of this.intersections) {
			if(o.model instanceof models.Vehicle) {
				this.player.rotation.z = o.rotation.z;
				this.vehicle = o;
				this.vehicle.parent.remove(this.vehicle);
				console.log("Entered " + o.model.name);
				this.speed = 0;
				if (this.vehicle.model.flies) {
					this.noise.setMode("jet");
				} else {
					this.noise.setMode("car");
				}
				break;
			}
		}
	}

	getMaxSpeed() {
		if(DEBUG) return 20000;

		if(this.vehicle) {
			return this.vehicle.model.speed;
		} else {
			return 1000;
		}
	}

	getTurnSpeed() {
		if(this.vehicle) {
			var sp = this.speed / 500; // after 500 turning is full-speed
			return 0.001 * (sp > 1 ? 1 : sp);
		} else {
			return 0.002;
		}
	}

	getRollSpeed() {
		if(DEBUG) return this.getTurnSpeed();

		if(this.vehicle && this.vehicle.model.flies && this.player.position.z > DEFAULT_Z) {
			return this.getTurnSpeed();
		} else {
			return 0;
		}
	}

	getPitchSpeed() {
		if(DEBUG) return 0.0005;

		if(this.vehicle && this.vehicle.model.flies && this.speed > STALL_SPEED) {
			return 0.0005;
		} else {
			return 0;
		}
	}

	getPitch() {
		let p = (this.pitch.rotation.x - Math.PI/2) % (Math.PI * 2);
		if(p < 0) p += Math.PI * 2;
		return p;
	}

	getPitchAngle() {
		return Math.round(util.rad2angle(this.getPitch()));
	}

	getHeading() {
		var angle = this.player.rotation.z;
		// clamp to 0,2pi
		angle = angle % (Math.PI*2);
		if(angle < 0) angle += Math.PI*2;
		return angle;
	}

	getRoll() {
		var angle = this.roll.rotation.y;
		// cap -2pi,2pi
		angle = angle % (Math.PI*2);
		return angle;
	}

	getHeadingAngles() {
		return Math.round(util.rad2angle(this.getHeading()));
	}

	isStalling() {
		return this.vehicle && this.vehicle.model.flies && this.speed < STALL_SPEED && this.player.position.z > DEFAULT_Z;
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;

		var dx = this.speed / 20 * delta;
		if(this.player.position.z > DEFAULT_Z) {
			this.player.rotation.z -= Math.sin(this.getRoll()) * 0.075;
		}

		// the roll affects the pitch's direction
		let r = Math.abs(this.getRoll());
		let d = r >= Math.PI*.5 && r < Math.PI*1.5 ? -1 : 1;
		this.rotation.set( this.getPitch() * d, this.getHeading(), 0 );
		this.direction.applyEuler( this.rotation );
		this.player.translateOnAxis(this.direction, dx);
		this.direction.set(0, 1, 0);

		$("#message .value").text(
			"YAW:" + this.getHeading().toFixed(2) +
			" PITCH:" + this.getPitch().toFixed(2) +
			" ROLL:" + this.getRoll().toFixed(2));

		// stalling
		if(this.isStalling()) {
			this.pitch.rotation.x += (this.pitch.rotation.x > 0 ? -1 : 1) * 0.02;
		}

		this.noise.setLevel(this.speed / this.getMaxSpeed());

		if(this.player.position.z <= DEFAULT_Z) {
			this.pitch.rotation.x = Math.max(this.pitch.rotation.x, Math.PI/2);
			this.roll.rotation.y = 0;
		}

		if(this.player.position.z < DEFAULT_Z) this.player.position.z = DEFAULT_Z;

		this.prevTime = time;

		this.bbox.min.set(this.player.position.x - SIZE, this.player.position.y - SIZE, this.player.position.z - SIZE);
		this.bbox.max.set(this.player.position.x + SIZE, this.player.position.y + SIZE, this.player.position.z + SIZE);

		// check for intersections
		this.intersections.splice(0, this.intersections.length);
		for(let o of this.main.game_map.structures) {
			this.model_bbox.setFromObject(o);
			if (this.model_bbox.isIntersectionBox(this.bbox)) {
				this.intersections.push(o);
			}
		}
	}
}