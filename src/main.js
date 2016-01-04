import THREE from 'three.js';
import * as game_map from 'game_map';
import $ from 'jquery';
import * as util from 'util';
import * as movement from 'movement';
import * as skybox from "skybox"
import * as model from 'model'

const LIMIT_FPS = 15; // set to 0 for no limit
const ASPECT_RATIO = 320/200;
const FAR_DIST = 100000;

class Merc {
	constructor() {
		var models = new model.Models((models)=>this.init(models))
	}

	init(models) {
		this.models = models;
		this.camera = new THREE.PerspectiveCamera( 65, ASPECT_RATIO, 1, FAR_DIST );

		this.scene = new THREE.Scene();

		this.movement = new movement.Movement(this);
		this.movement.player.position.set(game_map.SECTOR_SIZE * 10, game_map.SECTOR_SIZE * 12, movement.DEFAULT_Z);

		this.skybox = new skybox.Skybox(this.movement.player, FAR_DIST);

		this.game_map = new game_map.GameMap(this.scene, this.models, this.movement.player);

		this.renderer = new THREE.WebGLRenderer();
		var h = window.innerHeight * .75;
		this.renderer.setSize( h * ASPECT_RATIO, h );

		var height = h * 0.333;
		$("#ui").css({
			width: h * ASPECT_RATIO + "px",
			height: height + "px",
		});
		$(".uibox .value").css("font-size", Math.round(h/200*10) + "px");
		this.canvas_width = $("#el").width();
		this.canvas_height = height - 40;
		$("#el_canvas").css({
			width: this.canvas_width + "px",
			height: this.canvas_height + "px"
		});

		this.compScale = 3.0;
		$("#comp_canvas").css({
			width: 540 * this.compScale + "px",
			height: this.canvas_height + "px"
		});
		var ctx = $("#comp_canvas")[0].getContext('2d');
		ctx.fillStyle = "#ffffff";
		ctx.font = "8px sans-serif";
		for(let angle = 0; angle < 540; angle++) {
			if(angle % 10 == 0) {
				ctx.fillRect(angle * this.compScale, 0, this.compScale, this.canvas_height/2);
				ctx.fillText("" + angle, (angle - 5) * this.compScale, this.canvas_height / 2 + 10);
			} else if(angle % 5 == 0) {
				ctx.fillRect(angle * this.compScale, 0, this.compScale, this.canvas_height/4);
			}
		}

		$("body").append( this.renderer.domElement );
		$("body").click((event) => {
			var element = event.target;
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		});

		this.animate();
	}

	animate() {
		this.game_map.update();
		this.movement.update();
		this.renderer.render(this.scene, this.camera);

		var x = Math.round(this.movement.player.position.x / game_map.SECTOR_SIZE);
		var y = Math.round(this.movement.player.position.y / game_map.SECTOR_SIZE);
		var z = Math.round(this.movement.player.position.z) - movement.DEFAULT_Z;
		$("#loc .value").text("" + x + "-" + y);
		$("#alt .value").text("" + z);
		$("#speed .value").text("" + Math.round(this.movement.speed / 100.0));
		//$("#el .value").text("" + Math.round(util.rad2angle(this.movement.getPitch())) % 360);
		//$("#comp .value").text("" + Math.round(util.rad2angle(this.movement.getHeading()) + 360) % 360);

		this.drawEl(Math.round(util.rad2angle(this.movement.getPitch())) % 360);
		this.drawComp(Math.round(util.rad2angle(this.movement.getHeading()) + 360) % 360);
		var compAngle = Math.round(util.rad2angle(this.movement.getHeading()) + 360) % 360;
		$("#comp_canvas").css("margin-left", "-" + ((compAngle - this.canvas_width/2) * this.compScale) + "px");

		if(LIMIT_FPS) {
			setTimeout(()=> {
				requestAnimationFrame(util.bind(this, this.animate));
			}, 1000/LIMIT_FPS);
		} else {
			requestAnimationFrame(util.bind(this, this.animate));
		}
	}

	drawEl(angle) {

	}

	drawComp(angle) {
	}


}

$(document).ready(function() {
	window.merc = new Merc();
});
