/**
 * originally from:
 * view-source:http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
 */
import THREE from 'three.js';
import $ from 'jquery';
import * as models from 'model'
import * as util from 'util'
import * as noise from 'noise'
import * as room from 'room'
import * as game_map from 'game_map'

const SIZE = 20;
export const DEFAULT_Z = 20;
const STALL_SPEED = 5000;
const DEBUG = false;
export const ROOM_DEPTH = -300;

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
		this.room = null;
		this.liftDirection = 0;
		this.sectorX = 0;
		this.sectorY = 0;
		this.power = 0.0;
		this.fw = false;
		this.bw = false;
		this.left = false;
		this.right = false;

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

			// todo: flip the roll angle if pitch crosses 90 or -90 degrees, so it doesn't register as a crash when landing w. 180 roll
			this.pitch.rotation.x += this.movementY * this.getPitchSpeed();
		});

		$(document).keydown(( event ) => {
			switch ( event.keyCode ) {
				case 87: this.fw = true; break;
				case 83: this.bw = true; break;
				case 65: this.left = true; break;
				case 68: this.right = true; break;
			}
		});

		$(document).keyup(( event ) => {
			//console.log(event.keyCode);
			switch( event.keyCode ) {
				case 87: this.fw = false; break;
				case 83: this.bw = false; break;
				case 65: this.left = false; break;
				case 68: this.right = false; break;
				case 192: this.power = 0.0; break;
				case 49: this.power = 0.1; break;
				case 50: this.power = 0.2; break;
				case 51: this.power = 0.3; break;
				case 52: this.power = 0.4; break;
				case 53: this.power = 0.5; break;
				case 54: this.power = 0.6; break;
				case 55: this.power = 0.7; break;
				case 56: this.power = 0.8; break;
				case 57: this.power = 0.9; break;
				case 48: this.power = 1.0; break;
				case 32:
					if(this.vehicle) {
						if(this.player.position.z <= DEFAULT_Z) {
							this.exitVehicle();
						}
					} else {
						this.enterVehicle();
					}
					break;
				case 69: // e
					this.useElevator();
					break;
			}
		});
	}

	useElevator() {
		if(this.vehicle || this.liftDirection) return;

		var offsetX = this.player.position.x % game_map.SECTOR_SIZE;
		var offsetY = this.player.position.y % game_map.SECTOR_SIZE;
		if(this.room && this.room.elevator) {
			// up
			this.liftDirection = 1;
			this.room.positionLift(offsetX, offsetY);
			console.log("heading up");
		} else if(!this.room && this.inElevator()) {
			// down
			this.sectorX = (this.player.position.x / game_map.SECTOR_SIZE) | 0;
			this.sectorY = (this.player.position.y / game_map.SECTOR_SIZE) | 0;

			this.room = this.main.game_map.getRoom(this.sectorX, this.sectorY);
			if(this.room) {
				this.liftDirection = -1;
				console.log("heading down");
				// create room
				this.room.create(this.main.game_map.getSector(this.sectorX, this.sectorY), offsetX, offsetY);
			}
		}
	}

	inElevator() {
		// todo: use any instead
		return this.intersections.filter((o)=>o.model.name == "elevator").length > 0;
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
		this.stop();
	}

	enterVehicle() {
		for(let o of this.intersections) {
			if(o.model instanceof models.Vehicle) {
				this.player.rotation.z = o.rotation.z;
				this.vehicle = o;
				this.vehicle.parent.remove(this.vehicle);
				console.log("Entered " + o.model.name);
				this.stop();
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
			return 1500;
		}
	}

	getTurnSpeed() {
		if(this.vehicle) {
			var sp = this.getSpeed() / 500; // after 500 turning is full-speed
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

		if(this.vehicle && this.vehicle.model.flies && this.getSpeed() > STALL_SPEED) {
			return 0.0005;
		} else {
			return 0;
		}
	}

	getPitch() {
		// clamp to 0,360
		let p = (this.pitch.rotation.x - Math.PI/2) % (Math.PI * 2);
		if(p < 0) p += Math.PI * 2;
		return p;
	}

	getPitchAngle() {
		var p = Math.round(util.rad2angle(this.getPitch()));
		if(p > 90) p = 90 - (p - 90);
		if(p > 180) p = -(360 - p);
		if(p < -90) p = -(180 + p);
		return p;
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

	getRollAngle() {
		return Math.round(util.rad2angle(this.getRoll()));
	}

	getHeadingAngle() {
		return Math.round(util.rad2angle(this.getHeading()));
	}

	isStalling() {
		return this.vehicle && this.vehicle.model.flies && this.getSpeed() < STALL_SPEED && this.player.position.z > DEFAULT_Z;
	}

	getSpeed() {
		if(this.vehicle) {
			return this.power * this.getMaxSpeed();
		} else {
			if(this.fw || this.bw || this.left || this.right) {
				return this.getMaxSpeed();
			} else {
				return 0;
			}
		}
	}

	stop() {
		this.power = 0;
		this.fw = this.bw = this.left = this.right = false;
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;
		this.prevTime = time;

		if(this.liftDirection != 0) {
			let room_z = ROOM_DEPTH;
			let pz = this.player.position.z / room_z;
			let liftSpeed = 5 + Math.abs(Math.sin(Math.PI * pz)) * 100;
			this.player.position.z += this.liftDirection * delta * liftSpeed;
			if (this.liftDirection < 0 && this.player.position.z <= room_z) {
				this.player.position.z = room_z;
				this.liftDirection = 0;
			} else if (this.liftDirection > 0 && this.player.position.z >= DEFAULT_Z) {
				this.player.position.z = DEFAULT_Z;
				this.liftDirection = 0;
				this.room.destroy();
				this.room = null;
			}
		} else {
			var in_air_before = this.player.position.z > DEFAULT_Z;

			var dx = this.getSpeed() / 20 * delta;
			if(this.vehicle) {
				this.direction.set(0, 1, 0);
			} else {
				if(this.fw) {
					this.direction.set(0, 1, 0);
				} else if(this.bw) {
					dx *= -1;
					this.direction.set(0, 1, 0);
				} else if(this.right) {
					this.direction.set(1, 0, 0);
				} else if(this.left) {
					dx *= -1;
					this.direction.set(1, 0, 0);
				}
			}
			if (this.player.position.z > DEFAULT_Z) {
				this.player.rotation.z -= Math.sin(this.getRoll()) * 0.075;
			}

			// the roll affects the pitch's direction
			let r = Math.abs(this.getRoll());
			let d = r >= Math.PI * .5 && r < Math.PI * 1.5 ? -1 : 1;
			this.rotation.set(this.getPitch() * d, this.getHeading(), 0);
			this.direction.applyEuler(this.rotation);
			this.player.translateOnAxis(this.direction, dx);


			//$("#message .value").text(
			//	"YAW:" + this.getHeadingAngle() +
			//	" PITCH:" + this.getPitchAngle() +
			//	" ROLL:" + this.getRollAngle());

			// stalling
			if (this.isStalling()) {
				this.pitch.rotation.x += (this.pitch.rotation.x > 0 ? -1 : 1) * 0.02;
			}

			if(this.getSpeed() > 0) {
				this.noise.start();
			} else {
				this.noise.stop();
			}
			this.noise.setLevel(this.getSpeed() / this.getMaxSpeed());

			if (this.player.position.z <= DEFAULT_Z) {
				// reset speed and pitch on crash
				if (in_air_before && (Math.abs(this.getPitchAngle()) > 25 || Math.abs(this.getRollAngle()) > 25)) {
					console.log("Crash");
					this.pitch.rotation.x = Math.PI / 2;
					this.stop();
				} else {
					// limit pitch on ground
					this.pitch.rotation.x = Math.min(Math.max(this.pitch.rotation.x, Math.PI / 2), Math.PI);
				}
				this.roll.rotation.y = 0;
			}

			if (!this.room && this.player.position.z < DEFAULT_Z) this.player.position.z = DEFAULT_Z;

			this.bbox.min.set(this.player.position.x - SIZE, this.player.position.y - SIZE, this.player.position.z - SIZE);
			this.bbox.max.set(this.player.position.x + SIZE, this.player.position.y + SIZE, this.player.position.z + SIZE);

			// check for intersections
			this.intersections.splice(0, this.intersections.length);
			for (let o of this.main.game_map.structures) {
				this.model_bbox.setFromObject(o);
				if (this.model_bbox.isIntersectionBox(this.bbox)) {
					this.intersections.push(o);
				}
			}
		}
	}
}