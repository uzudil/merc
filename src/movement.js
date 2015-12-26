/**
 * originally from:
 * view-source:http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
 */
import THREE from 'three.js';
import $ from 'jquery';
import * as models from 'model'

const SIZE = 20;

export class Movement {
	constructor(game_map, player_control) {
		this.game_map = game_map;
		this.player_control = player_control;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.prevTime = Date.now();
		this.velocity = new THREE.Vector3();

		this.intersections = [];
		this.bbox = new THREE.Box3(new THREE.Vector3(-SIZE, -SIZE, -SIZE), new THREE.Vector3(SIZE, SIZE, SIZE));
		this.model_bbox = new THREE.Box3();

		this.vehicle = null;

		$(document).keydown(( event ) => {
			switch ( event.keyCode ) {
				case 38: // up
				case 87: // w
					this.moveForward = true;
					break;
				case 37: // left
				case 65: // a
					this.moveLeft = true; break;
				case 40: // down
				case 83: // s
					this.moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					this.moveRight = true;
					break;
			}
		});

		$(document).keyup(( event ) => {
			//console.log(event.keyCode);
			switch( event.keyCode ) {
				case 38: // up
				case 87: // w
					this.moveForward = false;
					break;
				case 37: // left
				case 65: // a
					this.moveLeft = false;
					break;
				case 40: // down
				case 83: // s
					this.moveBackward = false;
					break;
				case 39: // right
				case 68: // d
					this.moveRight = false;
					break;
				case 32:
					if(this.vehicle) this.exitVehicle();
					else this.enterVehicle();
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
	}

	enterVehicle() {
		for(let o of this.intersections) {
			if(o.model instanceof models.Vehicle) {
				this.player_control.setDirection(o.rotation);
				this.vehicle = o;
				this.vehicle.parent.remove(this.vehicle);
				console.log("Entered " + o.model.name);
				break;
			}
		}
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.y -= this.velocity.y * 10.0 * delta;

		if ( this.moveForward ) this.velocity.y += 4000.0 * delta;
		if ( this.moveBackward ) this.velocity.y -= 4000.0 * delta;

		if ( this.moveLeft ) this.velocity.x -= 400.0 * delta;
		if ( this.moveRight ) this.velocity.x += 400.0 * delta;

		this.player_control.getObject().translateX( this.velocity.x * delta );
		this.player_control.getObject().translateY( this.velocity.y * delta );

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