/**
 * original from:
 * http://mrdoob.github.io/three.js/examples/js/controls/PointerLockControls.js
 * @author mrdoob / http://mrdoob.com/
 */

import THREE from 'three.js';
import $ from 'jquery';
import * as movement from 'movement'

export class PointerLockControls {
	constructor(main) {
		this.main = main;
		main.camera.rotation.set( 0, 0, 0 );

		this.pitchObject = new THREE.Object3D();
		this.pitchObject.rotation.x = Math.PI / 2;
		this.pitchObject.add( main.camera );

		this.rollObject = new THREE.Object3D();
		//this.rollObject.rotation.y = -Math.PI;
		this.rollObject.add( this.pitchObject );

		this.yawObject = new THREE.Object3D();
		this.yawObject.rotation.z = Math.PI;
		this.yawObject.add( this.rollObject );

		this.PI_2 = Math.PI / 2;
		this.dir = new THREE.Vector3();

		this.movementX = 0.0;
		this.movementY = 0.0;

		this.enabled = true;
		$(document).mousemove((event) => {
			this.movementX = event.originalEvent.movementX;
			this.movementY = event.originalEvent.movementY;

			if(this.getObject().position.z <= movement.DEFAULT_Z) {
				this.yawObject.rotation.z -= this.movementX * this.main.movement.getTurnSpeed();
				this.rollObject.rotation.y = 0;
			} else {
				this.rollObject.rotation.y += this.movementX * this.main.movement.getRollSpeed();
			}
			this.pitchObject.rotation.x += this.movementY * this.main.movement.getPitchSpeed();

			if(this.yawObject.position.z <= movement.DEFAULT_Z) {
				this.pitchObject.rotation.x = Math.max(this.pitchObject.rotation.x, Math.PI/2);
				this.rollObject.rotation.y = 0;
			}
		});

		this.getDirection = function() {
			// assumes the camera itself is not rotated
			var direction = new THREE.Vector3( 0, 0, - 1 );
			var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

			return function( v ) {
				rotation.set( this.pitchObject.rotation.x, this.yawObject.rotation.y, 0 );
				v.copy( direction ).applyEuler( rotation );
				return v;
			}
		}();
	}

	update() {
		if(this.getObject().position.z > movement.DEFAULT_Z) {
			this.yawObject.rotation.z -= this.rollObject.rotation.y * 0.075;
		}
		if(this.main.movement.isStalling()) {
			this.pitchObject.rotation.x += (this.pitchObject.rotation.x > 0 ? -1 : 1) * 0.02;
		}
	}

	getPitch() {
		return this.pitchObject.rotation.x - Math.PI/2;
	}

	setDirection(euler) {
		//this.pitchObject.rotation.x = euler.x;
		this.yawObject.rotation.z = euler.z;
	}

	getZRot() {
		return this.yawObject.rotation.z;
	}

	static dispose() {
		$(document).unbind("mousemove");
	}

	getObject() {
		return this.yawObject;
	}
}
