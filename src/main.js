import THREE from 'three.js'
import * as game_map from 'game_map'
import $ from 'jquery'
import * as util from 'util'
import * as movement from 'movement'
import * as skybox from "skybox"
import * as model from 'model'
import * as compass from 'compass'

const LIMIT_FPS = 15; // set to 0 for no limit
const ASPECT_RATIO = 320/200;
const FAR_DIST = 100000;
const START_X = 9;
const START_Y = 3;

class Merc {
	constructor() {
		new model.Models((models)=>this.init(models))
	}

	init(models) {
		this.models = models;
		this.camera = new THREE.PerspectiveCamera( 65, ASPECT_RATIO, 1, FAR_DIST );

		this.scene = new THREE.Scene();

		this.movement = new movement.Movement(this);
		this.movement.player.position.set(game_map.SECTOR_SIZE * START_X, game_map.SECTOR_SIZE * START_Y, movement.DEFAULT_Z);

		this.skybox = new skybox.Skybox(this.movement.player, FAR_DIST);

		this.game_map = new game_map.GameMap(this.scene, this.models, this.movement.player);

		this.renderer = new THREE.WebGLRenderer();
		var h = window.innerHeight * .75;
		this.renderer.setSize( h * ASPECT_RATIO, h );

		var height = (h * 0.333)|0;
		$("#ui").css({
			width: h * ASPECT_RATIO + "px",
			height: height + "px",
		});
		$(".uibox .value").css("font-size", Math.round(h/200*10) + "px");
		let canvas_width = $("#el").width();
		let canvas_height = height - 40;

		$("#el .horiz_line").css({
			"top": ((canvas_height/2)|0) + "px",
			"width": ((canvas_width + 2)|0) + "px"
		});
		$("#comp .vert_line").css({
			"left": ((canvas_width/2)|0) + "px",
			"height": ((canvas_height/2 + 2)|0) + "px"
		});

		$("#el .value").css({
			height: canvas_height + "px",
			overflow: "hidden"
		});
		// sizing via css will make the canvas blurry :-(
		$("#el_canvas").attr({
			width: canvas_width,
			height: canvas_height
		});

		this.compass = new compass.Compass(canvas_width, canvas_height * 0.5);
		this.horizon = new compass.Horizon(canvas_width, canvas_height);

		$("body").append( this.renderer.domElement );
		$("body").click((event) => {
			var element = event.target;
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		});


		// hack: start in a room
		this.movement.loadGame({
			sectorX: 9, sectorY: 2,
			x: game_map.SECTOR_SIZE/2, y: game_map.SECTOR_SIZE/2, z: movement.ROOM_DEPTH,
			vehicle: null
		});

		this.animate();
	}

	animate() {
		this.game_map.update();
		this.movement.update();
		this.renderer.render(this.scene, this.camera);

		var x, y;
		if(this.movement.level) {
			x = this.movement.sectorX;
			y = this.movement.sectorY;
		} else {
			x = Math.round(this.movement.player.position.x / game_map.SECTOR_SIZE);
			y = Math.round(this.movement.player.position.y / game_map.SECTOR_SIZE);
		}
		var z = Math.round(this.movement.player.position.z) - movement.DEFAULT_Z;
		$("#loc .value").text("" + x + "-" + y);
		$("#alt .value").text("" + z);
		$("#speed .value").text("" + Math.round(this.movement.getSpeed() / 100.0));
		this.compass.update(this.movement.getHeadingAngle());
		this.horizon.update(this.movement.getPitchAngle());

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
