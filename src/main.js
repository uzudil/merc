import THREE from 'three.js';
import * as game_map from 'game_map';
import $ from 'jquery';
import * as plc from 'pointerlockcontrols';
import * as util from 'util';
import * as movement from 'movement';

class Merc {
	constructor() {
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );

		this.scene = new THREE.Scene();

		this.controls = new plc.PointerLockControls( this.camera );
		this.controls.getObject().position.set(game_map.SECTOR_SIZE * game_map.SECTOR_COUNT/2, game_map.SECTOR_SIZE * game_map.SECTOR_COUNT/2, 20);
		this.scene.add( this.controls.getObject() );

		this.movement = new movement.Movement();

		this.game_map = new game_map.GameMap(this.scene);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor( 0xaaaaff );

		$("body").append( this.renderer.domElement );
		$("body").click((event) => {
			var element = event.target;
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		});

		this.animate();
	}

	animate() {
		this.movement.update(this.controls.getObject());
		this.game_map.update(this.controls.getObject());
		this.renderer.render( this.scene, this.camera );

		if(LIMIT_FPS) {
			setTimeout(()=> {
				requestAnimationFrame(util.bind(this, this.animate));
			}, 1000/LIMIT_FPS);
		} else {
			requestAnimationFrame(util.bind(this, this.animate));
		}

	}
}

// main loop start
var LIMIT_FPS = 15; // set to 0 for no limit
window.merc = new Merc();

