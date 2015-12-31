/**
 * originally from:
 * view-source:http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
 */
import THREE from 'three.js';
import $ from 'jquery';
import * as models from 'model'

const SIZE = 20;
export const DEFAULT_Z = 20;

export class Movement {
	constructor(game_map, player_control) {
		this.game_map = game_map;
		this.player_control = player_control;

		this.prevTime = Date.now();
		this.velocity = new THREE.Vector3();

		this.intersections = [];
		this.bbox = new THREE.Box3(new THREE.Vector3(-SIZE, -SIZE, -SIZE), new THREE.Vector3(SIZE, SIZE, SIZE));
		this.model_bbox = new THREE.Box3();

		this.vehicle = null;
		this.speed = 0;

		$(document).keydown(( event ) => {
			switch ( event.keyCode ) {
				case 187: // +
					this.speed = this.speed > 0 ? this.speed * 1.25 : 200;
					if(this.speed > this.getMaxSpeed()) this.speed = this.getMaxSpeed();
					break;
				case 189: // -
					this.speed = this.speed * .75;
					if(Math.abs(this.speed) < 1) {
						this.speed = 0;
					}
					break;
			}
		});

		$(document).keyup(( event ) => {
			console.log(event.keyCode);
			switch( event.keyCode ) {
				case 32:
					if(this.vehicle) {
						if(this.player_control.getObject().position.z <= DEFAULT_Z) {
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
		this.game_map.addModelAt(
			this.player_control.getObject().position.x,
			this.player_control.getObject().position.y,
			this.vehicle.model,
			this.player_control.getZRot());
		this.vehicle = null;
		this.speed = 0;
	}

	enterVehicle() {
		for(let o of this.intersections) {
			if(o.model instanceof models.Vehicle) {
				this.player_control.setDirection(o.rotation);
				this.vehicle = o;
				this.vehicle.parent.remove(this.vehicle);
				console.log("Entered " + o.model.name);
				this.speed = 0;
				break;
			}
		}
	}

	getMaxSpeed() {
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
		if(this.vehicle && this.vehicle.model.flies && this.player_control.getObject().position.z > DEFAULT_Z) {
			return this.getTurnSpeed();
		} else {
			return 0;
		}
	}

	getPitchSpeed() {
		if(this.vehicle && this.vehicle.model.flies && this.speed > 5000) {
			return 0.0005;
		} else {
			return 0;
		}
	}

	isStalling() {
		return this.vehicle && this.vehicle.model.flies && this.speed < 5000 && this.player_control.getObject().position.z > DEFAULT_Z;
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;

		this.velocity.y = this.speed * delta;
		var pitch = this.player_control.getPitch();
		if(pitch != 0) {
			this.velocity.z = this.velocity.y * Math.tan(pitch);
		}

		//this.player_control.getObject().translateX( this.velocity.x * delta );
		this.player_control.getObject().translateY( this.velocity.y * delta );
		this.player_control.getObject().translateZ( this.velocity.z * delta );
		if(this.player_control.getObject().position.z < 20) this.player_control.getObject().position.z = 20;

		this.prevTime = time;

		this.bbox.min.set(this.player_control.getObject().position.x - SIZE, this.player_control.getObject().position.y - SIZE, this.player_control.getObject().position.z - SIZE);
		this.bbox.max.set(this.player_control.getObject().position.x + SIZE, this.player_control.getObject().position.y + SIZE, this.player_control.getObject().position.z + SIZE);

		// check for intersections
		this.intersections.splice(0, this.intersections.length);
		for(let o of this.game_map.structures) {
			this.model_bbox.setFromObject(o);
			if (this.model_bbox.isIntersectionBox(this.bbox)) {
				this.intersections.push(o);
			}
		}
	}
}