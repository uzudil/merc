import THREE from 'three.js';
import * as game_map from 'game_map';
import $ from 'jquery';
import * as plc from 'pointerlockcontrols';
import * as util from 'util';
import * as movement from 'movement';
import * as skybox from "skybox"
import * as model from 'model'

const LIMIT_FPS = 15; // set to 0 for no limit
const ASPECT_RATIO = 320/200;
const DEFAULT_Z = 20;
const FAR_DIST = 10000;

class Merc {
	constructor() {
		var models = new model.Models((models)=>this.init(models))
	}

	init(models) {
		this.models = models;
		this.camera = new THREE.PerspectiveCamera( 50, ASPECT_RATIO, 1, FAR_DIST );

		this.scene = new THREE.Scene();

		this.controls = new plc.PointerLockControls( this.camera );
		this.controls.getObject().position.set(game_map.SECTOR_SIZE * 9, game_map.SECTOR_SIZE * 9, DEFAULT_Z);
		this.scene.add( this.controls.getObject() );

		this.skybox = new skybox.Skybox(this.controls.getObject(), FAR_DIST);

		var player = this.controls.getObject();
		this.game_map = new game_map.GameMap(this.scene, this.models, player);

		this.movement = new movement.Movement(this.game_map, this.controls);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerHeight * ASPECT_RATIO, window.innerHeight );

		console.log("setting font size to " + (Math.round(window.innerHeight/200*12) + "px"));
		$("#ui").css({
			width: window.innerHeight * ASPECT_RATIO + "px",
			height: window.innerHeight *  0.25 + "px",
		});
		$(".uibox").css("font-size", Math.round(window.innerHeight/200*10) + "px");

		$("body").append( this.renderer.domElement );
		$("body").click((event) => {
			var element = event.target;
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		});

		this.animate();
	}

	animate() {
		this.game_map.update(this.controls.getObject());
		this.movement.update();
		this.renderer.render(this.scene, this.camera);

		var x = Math.round(this.controls.getObject().position.x / game_map.SECTOR_SIZE);
		var y = Math.round(this.controls.getObject().position.y / game_map.SECTOR_SIZE);
		var z = Math.round(this.controls.getObject().position.z) - DEFAULT_Z;
		$("#loc").text("" + x + "-" + y);
		$("#alt").text("" + z);
		$("#speed").text("" + Math.round(this.movement.speed / 100.0));

		if(LIMIT_FPS) {
			setTimeout(()=> {
				requestAnimationFrame(util.bind(this, this.animate));
			}, 1000/LIMIT_FPS);
		} else {
			requestAnimationFrame(util.bind(this, this.animate));
		}

	}


}

$(document).ready(function() {
	window.merc = new Merc();
});
