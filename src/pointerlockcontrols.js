/**
 * original from:
 * http://mrdoob.github.io/three.js/examples/js/controls/PointerLockControls.js
 * @author mrdoob / http://mrdoob.com/
 */

import THREE from 'three.js';
import $ from 'jquery';

export class PointerLockControls {
	constructor(camera) {
		camera.rotation.set( 0, 0, 0 );

		this.pitchObject = new THREE.Object3D();
		this.pitchObject.rotation.x = Math.PI / 2;
		this.pitchObject.add( camera );

		this.yawObject = new THREE.Object3D();
		this.yawObject.rotation.z = Math.PI;
		this.yawObject.add( this.pitchObject );

		this.PI_2 = Math.PI / 2;
		this.dir = new THREE.Vector3();

		this.enabled = true;
		$(document).mousemove((event) => {
			var movementX = event.originalEvent.movementX;
			var movementY = event.originalEvent.movementY;

			this.yawObject.rotation.z -= movementX * 0.002;
			this.pitchObject.rotation.x -= movementY * 0.002;

			//this.pitchObject.rotation.x = Math.max( - this.PI_2, Math.min( this.PI_2, this.pitchObject.rotation.x ) );
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

	static dispose() {
		$(document).unbind("mousemove");
	}

	getObject() {
		return this.yawObject;
	}
}
