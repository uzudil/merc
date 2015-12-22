/**
 * originally from:
 * view-source:http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
 */
import THREE from 'three.js';
import $ from 'jquery';

export class Movement {
	constructor() {
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.prevTime = Date.now();
		this.velocity = new THREE.Vector3();

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
			}
		});
	}

	update(object) {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.y -= this.velocity.y * 10.0 * delta;

		if ( this.moveForward ) this.velocity.y += 4000.0 * delta;
		if ( this.moveBackward ) this.velocity.y -= 4000.0 * delta;

		if ( this.moveLeft ) this.velocity.x -= 400.0 * delta;
		if ( this.moveRight ) this.velocity.x += 400.0 * delta;

		object.translateX( this.velocity.x * delta );
		object.translateY( this.velocity.y * delta );

		this.prevTime = time;
	}
}