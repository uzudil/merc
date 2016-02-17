/**
 * originally from:
 * view-source:http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
 */
import THREE from 'three.js';
import $ from 'jquery';
import * as models from 'model'
import * as util from 'util'
import * as noise from 'noise'
import * as room_package from 'room'
import * as compounds from 'compounds'
import * as game_map from 'game_map'
import * as events from 'events'

const SIZE = 20;
export const DEFAULT_Z = 20;
const STALL_SPEED = 5000;
const DEBUG = false;
export const ROOM_DEPTH = -300;
const WALL_ACTIVATE_DIST = 20;
const ROOM_COLLISION_ENABLED = true;
const LANDING_TIME = 30000;
const LANDING_ALT = 90000;
const LANDING_LAST_PERCENT = .25;
const LANDING_BASE_PERCENT = .1;
const DOWN = new THREE.Vector3(0, 0, -1);

export class Movement {
	constructor(main) {
		this.main = main;

		this.noise = new noise.Noise();
		this.lastNoise = null;

		this.prevTime = Date.now();
		this.direction = new THREE.Vector3(0, 1, 0);
		this.rotation = new THREE.Euler(0, 0, 0, "ZXY");

		this.intersections = [];
		this.bbox = new THREE.Box3(new THREE.Vector3(-SIZE, -SIZE, -SIZE), new THREE.Vector3(SIZE, SIZE, SIZE));
		this.model_bbox = new THREE.Box3();

		this.inventory = [];
		this.vehicle = null;
		this.level = null;
		this.doorsUp = [];
		this.doorsDown = [];
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

		this.pitch.add(Movement.makeCrossHair());

		// room collisions
		this.raycaster = new THREE.Raycaster();
		this.raycaster.far = WALL_ACTIVATE_DIST;
		this.raycasterOutside = new THREE.Raycaster();
		this.raycasterOutside.far = 200;

		// tmp variables for ray casting
		this.worldPos = new THREE.Vector3();
		this.worldDir = new THREE.Vector3();
		this.worldNor = new THREE.Vector3();
		this.normalMatrix = new THREE.Matrix3();

		this.movementX = 0.0;
		this.movementY = 0.0;

		this.landing = 0;

		this.events = new events.Events(this);

		$(document).mousemove((event) => {
			if(this.landing != 0) return;

			this.movementX = event.originalEvent.movementX;
			this.movementY = event.originalEvent.movementY;

			if(this.isFlying()) {
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
			console.log(event.keyCode);
			switch( event.keyCode ) {
				case 27 && this.landing != 0:
					this.noise.stop("pink");
					this.landing = Date.now() - LANDING_TIME;
					break;
				case 70: this.main.incrFpsLimit(); break;
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
				case 48: {
					this.power = 1.0;
					if(this.vehicle && this.vehicle.model.name == "light") {
						this.main.benson.addMessage("Yee-haw!");
					}
					break;
				}
				case 81: noise.Noise.toggleSound(); break;
				case 32:
					if(this.vehicle) {
						if(!this.isFlying()) {
							this.exitVehicle();
						}
					} else {
						this.enterVehicle();
					}
					break;
				case 69: // e
					this.useElevator();
					break;
				case 80: // p
					this.pickup();
					break;
				case 72: // h
					$("#help").toggle();
					break;
			}
		});
	}

	loadGame(gameState) {
		this.player.position.set(
			gameState.sectorX * game_map.SECTOR_SIZE + gameState.x,
			gameState.sectorY * game_map.SECTOR_SIZE + gameState.y,
			gameState.z
		);
		this.inventory = gameState.inventory;
		this.vehicle = gameState.vehicle;
		this.sectorX = (this.player.position.x / game_map.SECTOR_SIZE) | 0;
		this.sectorY = (this.player.position.y / game_map.SECTOR_SIZE) | 0;
		this.liftDirection = 0;
		this.events.state = gameState.state;
		if(this.player.position.z == ROOM_DEPTH) {
			this.level = compounds.getLevel(this.sectorX, this.sectorY);
			if(this.level) {
				var offsetX = this.player.position.x;
				var offsetY = this.player.position.y;
				this.level.create(this.main.scene,
					offsetX, offsetY,
					offsetX - this.main.models.models["elevator"].bbox.size().x/2,
					offsetY - this.main.models.models["elevator"].bbox.size().y/2,
					this.main.models);
			}
		}
	}

	static makeCrossHair() {
		// the crosshair
		let crossHair = new THREE.Object3D();
		let horiz = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.01), new THREE.MeshBasicMaterial({color: "#ffffff"}));
		crossHair.add(horiz);
		let vert = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.1), new THREE.MeshBasicMaterial({color: "#ffffff"}));
		crossHair.add(vert);
		crossHair.position.z = -2;
		return crossHair;
	}

	pickup() {
		// find the world pos of player
		this.player.getWorldPosition(this.worldPos);

		// cast a ray in this direction
		this.normalToWorld(this.player, this.direction, this.worldDir);

		// find the closest intersection
		this.raycaster.set(this.worldPos, this.worldDir);
		let intersections = this.raycaster.intersectObject(this.level.targetMesh, true);
		let closest = intersections.length > 0 ? intersections[0] : null;
		if(closest && closest.object.model) {

			let handled = false;
			if(this.level) {
				let offsetX = this.player.position.x;
				let offsetY = this.player.position.y;

				let room = this.level.getRoomAtPos(new THREE.Vector3(offsetX, offsetY, this.player.position.z), true);
				handled = room && this.events.pickup(closest.object.model.name, this.sectorX, this.sectorY, room.color.getHexString().toUpperCase());
			}

			if(!handled) {
				this.inventory.push(closest.object.model.name);
				closest.object.parent.remove(closest.object);
				this.main.benson.addMessage(closest.object.model.description);
			}
		}
	}

	useElevator() {
		if(this.vehicle || this.liftDirection) return;

		let offsetX = this.player.position.x;
		let offsetY = this.player.position.y;
		if(this.level) {
			// up
			let room = this.level.getRoomAtPos(new THREE.Vector3(offsetX, offsetY, this.player.position.z), true);
			if(room && room.elevator) {

				// Reposition the level, the lift and the player at the elevator platform position.
				// This is so the player pops up in the middle of the elevator back on the surface.
				let dx = this.player.position.x - this.level.liftX;
				let dy = this.player.position.y - this.level.liftY;
				this.player.position.set(this.level.liftX, this.level.liftY, this.player.position.z);
				this.level.setPosition(this.level.mesh.position.x - dx, this.level.mesh.position.y - dy);

				this.liftDirection = 1;
				this.noise.stop("door");
				console.log("heading up");
			}
		} else if(!this.level) {
			let elevator = this.getElevator();
			if(elevator) {
				// down
				this.level = compounds.getLevel(this.sectorX, this.sectorY);
				if (this.level) {
					this.liftDirection = -1;
					// create room
					//this.level.create(this.main.game_map.getSector(this.sectorX, this.sectorY), offsetX, offsetY);

					let liftPos = elevator.getWorldPosition();
					this.level.create(this.main.scene, offsetX, offsetY, liftPos.x, liftPos.y, this.main.models);
				}
			}
		}
	}

	getElevator() {
		let objects = this.intersections.filter((o)=>o.model.name == "elevator");
		return objects.length > 0 ? objects[0] : null;
	}

	usingElevator() {
		return this.liftDirection != 0;
	}

	exitVehicle() {
		this.noise.stop("car");
		this.noise.stop("jet");
		this.main.game_map.addModelAt(
			this.player.position.x,
			this.player.position.y,
			this.player.position.z - DEFAULT_Z,
			this.vehicle.model,
			this.player.rotation.z);
		this.vehicle = null;
		this.stop();
	}

	enterVehicle() {
		for(let o of this.intersections) {
			this.noise.stop("walk");
			if(o.model instanceof models.Vehicle) {
				if(o.model.enterCheck(this)) {
					this.player.rotation.z = o.rotation.z;
					this.vehicle = o;
					this.vehicle.parent.remove(this.vehicle);
					this.main.benson.addMessage(o.model.description);
					this.stop();
				} else {
					this.noise.play("denied");
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

	isFlying() {
		return this.vehicle && this.vehicle.model.flies && this.player.position.z > DEFAULT_Z;
	}

	getRollSpeed() {
		if(DEBUG) return this.getTurnSpeed();

		if(this.isFlying()) {
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
		return this.isFlying() && this.getSpeed() < STALL_SPEED;
	}

	getSpeed() {
		if(this.landing) {
			return (this.player.position.z/(LANDING_ALT + DEFAULT_Z)) * 100000;
		} else if(this.vehicle) {
			if(this.vehicle.model.exp) {
				return this.power * this.power * this.getMaxSpeed();
			} else {
				return this.power * this.getMaxSpeed();
			}
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

	updateLift(delta) {
		let room_z = ROOM_DEPTH;
		let pz = this.player.position.z / room_z;
		let liftSpeed = 5 + Math.abs(Math.sin(Math.PI * pz)) * 100;
		this.noise.setLevel("lift", liftSpeed / 150);
		this.player.position.z += this.liftDirection * delta * liftSpeed;
		if (this.liftDirection < 0 && this.player.position.z <= room_z) {
			this.player.position.z = room_z;
			this.liftDirection = 0;
			this.noise.stop("lift");
		} else if (this.liftDirection > 0 && this.player.position.z >= DEFAULT_Z) {
			this.player.position.z = DEFAULT_Z;
			this.liftDirection = 0;
			this.level.destroy();
			this.level = null;
			this.noise.stop("lift");
		}
	}

	updateVehicle(dx, delta) {
		if(dx != 0) this.updateOutsideZ();

		var in_air_before = this.isFlying();

		this.direction.set(0, 1, 0);

		// while flying, roll affects heading
		if (this.isFlying()) {
			this.player.rotation.z -= Math.sin(this.getRoll()) * 0.075 * (15 * delta) * (this.getSpeed() / this.getMaxSpeed());
		}

		// the roll affects the pitch's direction
		let r = Math.abs(this.getRoll());
		let d = r >= Math.PI * .5 && r < Math.PI * 1.5 ? -1 : 1;
		this.rotation.set(this.getPitch() * d, 0, 0);
		this.direction.applyEuler(this.rotation);

		// actually move player forward
		this.player.translateOnAxis(this.direction, dx);

		// stalling
		if (this.isStalling()) {
			this.pitch.rotation.x += (this.pitch.rotation.x > 0 ? -1 : 1) * 0.02;
		}

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

		if (!this.level && this.player.position.z < DEFAULT_Z) this.player.position.z = DEFAULT_Z;
	}

	updateWalking(dx, delta) {
		this.direction.set(0, 1, 0);

		if(this.fw) {
			this.direction.set(0, 1, 0);
		} else if(this.bw) {
			this.direction.set(0, -1, 0);
		} else if(this.right) {
			this.direction.set(1, 0, 0);
		} else if(this.left) {
			this.direction.set(-1, 0, 0);
		}

		// actually move player forward
		if(ROOM_COLLISION_ENABLED && this.level) {
			this.updateWalkingInRoom(dx, delta);
		} else {
			if(this.fw || this.bw || this.left || this.right) {
				this.updateOutsideZ();
				this.player.translateOnAxis(this.direction, dx);
			}
		}
	}

	updateOutsideZ() {
		// find the world pos of player
		this.player.getWorldPosition(this.worldPos);
		this.worldPos.z += 50;

		// cast a ray in this direction
		this.normalToWorld(this.player, DOWN, this.worldDir);

		// find the closest intersection
		this.raycasterOutside.set(this.worldPos, this.worldDir);
		let intersections = this.raycasterOutside.intersectObject(this.main.game_map.land, true);
		let found = false;
		for(let closest of intersections) {
			if (closest && closest.object && closest.object.model && closest.object.model.lifts) {
				this.player.position.z = closest.point.z + DEFAULT_Z;
				found = true;
				break;
			}
		}
		if(!found && !this.isFlying()) {
			this.player.position.z = DEFAULT_Z;
		}
	}

	/**
	 * Convert a face normal of an object to world coordinates.
	 * @param object the object whose face normal this is
	 * @param normal the face normal
	 * @param worldNor where to store the results
	 * @returns {*}
	 */
	normalToWorld(object, normal, worldNor) {
		this.normalMatrix.getNormalMatrix(object.matrixWorld);
		worldNor.copy(normal);
		worldNor.applyMatrix3(this.normalMatrix).normalize();
		return worldNor;
	}

	openDoor(door) {
		if(door.door.key != "" && this.inventory.filter((o)=>door.door.key == o).length == 0) {
			// key needed
			this.noise.play("denied");
			return;
		}
		this.level.makeCave(door.door);
		if(door["original_z"] == null) door["original_z"] = door.position.z;
		door["moving"] = "up";
		this.doorsUp.push(door);
	}

	updateDoors(dx, delta) {
		if(this.doorsUp.length > 0) {
			for(let i = 0; i < this.doorsUp.length; i++) {
				let door = this.doorsUp[i];
				door.getWorldPosition(this.worldPos);
				let dz = ROOM_DEPTH + room_package.DOOR_HEIGHT * .8;
				if(this.worldPos.z < dz) {
					door.position.z += delta * 50;
					this.noise.setLevel("door", (room_package.DOOR_HEIGHT - Math.abs(dz - this.worldPos.z)) / room_package.DOOR_HEIGHT);
				} else {
					door.moving = "down";
					this.doorsUp.splice(i, 1);
					this.noise.stop("door");
					i--;
					setTimeout(()=>{
						this.doorsDown.push(door);
					}, 1500);
				}
			}
		}
		if(this.doorsDown.length > 0) {
			for(let i = 0; i < this.doorsDown.length; i++) {
				let door = this.doorsDown[i];
				if(door.position.z > door.original_z) {
					// todo: check for player...
					door.position.z -= delta * 50;
					if(door.position.z < door.original_z) door.position.z = door.original_z;
					this.noise.setLevel("door", (door.position.z - door.original_z) / room_package.DOOR_HEIGHT);
				} else {
					door.position.z = door.original_z;
					door.moving = null;
					this.doorsDown.splice(i, 1);
					this.noise.stop("door");
					i--;
				}
			}
		}
	}

	updateWalkingInRoom(dx, delta) {

		this.updateDoors(dx, delta);

		if(!(this.fw || this.bw || this.left || this.right)) return;

		// find the world pos of player
		this.player.getWorldPosition(this.worldPos);

		// cast a ray in this direction
		this.normalToWorld(this.player, this.direction, this.worldDir);

		// find the closest intersection
		this.raycaster.set(this.worldPos, this.worldDir);
		let intersections = this.raycaster.intersectObject(this.level.targetMesh, true);
		let closest = intersections.length > 0 ? intersections[0] : null;

		let blocked = false;
		if(closest) {
			if(closest.object.type == "door" && closest.object["moving"] == null) {
				this.openDoor(closest.object);
			}

			// models we can walk into
			if(!closest.object.model) {

				// intersected face's normal in world coords
				this.normalToWorld(closest.object, closest.face.normal, this.worldNor);

				// translate the normal to the intersection point
				this.worldNor.add(closest.point);

				// find a point perpendicular to the new normal from out current position
				// credit: http://stackoverflow.com/questions/10301001/perpendicular-on-a-line-segment-from-a-given-point
				var x1 = closest.point.x, y1 = closest.point.y,
					x2 = this.worldNor.x, y2 = this.worldNor.y,
					x3 = this.worldPos.x, y3 = this.worldPos.y;
				var px = x2 - x1, py = y2 - y1, dAB = px * px + py * py;
				var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
				var x = x1 + u * px, y = y1 + u * py;

				// these two points form the new direction
				this.worldDir.set(x, y, this.worldPos.z).sub(this.worldPos);

				// cast a ray this way too to make sure there isn't a corner we're running into
				this.raycaster.set(this.worldPos, this.worldDir);
				intersections = this.raycaster.intersectObject(this.level.targetMesh, true);
				if (intersections.length > 0 &&
					(intersections[0].face.normal.x != closest.face.normal.x ||
					intersections[0].face.normal.y != closest.face.normal.y)) {
					blocked = true;
				} else {
					// translate back to model coords
					this.direction.copy(this.player.worldToLocal(this.worldDir.add(this.worldPos)).normalize());
				}
			}
		}

		// move player if we're not blocked
		if(!blocked) this.player.translateOnAxis(this.direction, dx);
	}

	checkBoundingBox() {
		// check for intersections
		this.bbox.min.set(this.player.position.x - SIZE, this.player.position.y - SIZE, this.player.position.z - SIZE);
		this.bbox.max.set(this.player.position.x + SIZE, this.player.position.y + SIZE, this.player.position.z + SIZE);

		this.intersections.splice(0, this.intersections.length);
		for (let o of this.main.game_map.structures) {
			this.model_bbox.setFromObject(o);
			if (this.model_bbox.isIntersectionBox(this.bbox)) {
				this.intersections.push(o);
			}
		}
	}

	checkNoise() {
		// adjust noise
		if(this.landing != 0) return;

		if(this.liftDirection != 0 || this.doorsUp.length > 0) {
			// pass: set in updateLift, etc
		} else {
			let mode = this.vehicle ? this.vehicle.model.noise : "walk";
			if(this.lastNoise) this.noise.stop(this.lastNoise);
			this.lastNoise = this.mode;
			let lvl = this.getSpeed() / this.getMaxSpeed();
			if(lvl == 0) this.noise.stop(mode);
			else this.noise.setLevel(mode, lvl);
		}
	}

	updateLanding(time, delta) {
		if(this.landing > time) {
			let p = ((this.landing - time)/LANDING_TIME);
			this.player.position.z = Math.pow(p, 3) * LANDING_ALT + DEFAULT_Z;
			if(p > .5) this.player.rotation.z = Math.PI - p * Math.PI;
			if(p < LANDING_LAST_PERCENT && p >= LANDING_BASE_PERCENT) {
				this.pitch.rotation.x = (1 - ((p - LANDING_BASE_PERCENT) / (LANDING_LAST_PERCENT - LANDING_BASE_PERCENT))) * (Math.PI/2);
				this.noise.setLevel("pink", 1);
			} else if(p < LANDING_BASE_PERCENT) {
				this.noise.setLevel("pink", 1);
				this.pitch.rotation.x = Math.PI/2;
			}
		} else {
			console.log("landing ending");
			this.player.position.z = DEFAULT_Z;
			//this.player.rotation.z = 0;
			this.pitch.rotation.x = Math.PI/2;
			this.landing = false;
			this.noise.stop("pink");
			this.power = 0;

			// add ship behind player
			this.main.game_map.addModelAt(
				this.player.position.x + 100,
				this.player.position.y + 100,
				0,
				this.main.models.models["ship"],
				this.player.rotation.z);

			this.main.benson.addMessage("Welcome to Targ.");
			this.main.benson.addMessage("Please take the jet");
			this.main.benson.addMessage("and proceed to 9-2.");
			this.main.benson.addMessage("[SPACE] to use the jet.");
			this.main.benson.addMessage("[1]-[0] for power.");
			this.main.benson.addMessage("[SPACE] to get out again.");
		}
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;
		this.prevTime = time;

		if(!this.level) {
			this.sectorX = (this.player.position.x / game_map.SECTOR_SIZE) | 0;
			this.sectorY = (this.player.position.y / game_map.SECTOR_SIZE) | 0;
		}

		if(this.landing) {
			this.updateLanding(time, delta);
		} else {
			if (this.liftDirection != 0) {
				this.updateLift(delta);
			} else {
				var dx = this.getSpeed() / 20 * delta;
				if (this.vehicle) {
					this.updateVehicle(dx, delta);
				} else {
					this.updateWalking(dx, delta);
				}
				this.checkBoundingBox();
			}
		}

		this.checkNoise();
		this.events.update(this.sectorX, this.sectorY);
	}

	startLanding() {
		console.log("starting landing");
		this.landing = Date.now() + LANDING_TIME;
		this.pitch.rotation.x = 0;
		this.noise.setLevel("pink", 0);
	}
}