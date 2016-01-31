import THREE from 'three.js'
import * as game_map from 'game_map'
import $ from 'jquery'
import * as util from 'util'
import * as movement from 'movement'
import * as skybox from "skybox"
import * as model from 'model'
import * as compass from 'compass'
import * as benson from 'benson'
import * as space from 'space'

const LIMIT_FPS = 15; // set to 0 for no limit
const ASPECT_RATIO = 320/200;
const FAR_DIST = 100000;
const START_X = 9;
const START_Y = 3;
const START_Z = 50000;

class Merc {
	constructor() {
		new model.Models((models)=>this.init(models))
	}

	init(models) {
		this.models = models;
		this.camera = new THREE.PerspectiveCamera( 65, ASPECT_RATIO, 1, FAR_DIST );

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer();
		this.height = window.innerHeight * .75;
		this.renderer.setSize( this.height * ASPECT_RATIO, this.height );

		this.benson = new benson.Benson();

		this.setupUI();

		this.space = null;
		this.movement = null;
		//this.startGame();
		this.startIntro();

		this.animate();
	}

	startIntro() {
		this.space = new space.Space(this.scene, this);
		window.setTimeout(()=>{
			this.benson.addMessage("Set course to Novagen...");
			this.benson.addMessage("Engaging Hyperdrive", () => {
				this.space.power = 1;
				this.benson.addMessage("Enjoy your trip.");
				window.setTimeout(() => {
					this.benson.addMessage("Message received.");
					this.benson.addMessage("Sender: Targ city.");
					this.benson.addMessage("Priority: urgent.", ()=> {
						window.setTimeout(()=>{
							this.benson.addMessage("Request for assistance.");
							this.benson.addMessage("Targ city emergency.");
							this.benson.addMessage("Immediate help requested.", ()=> {
								setTimeout(()=> {
									this.benson.addMessage("Starting deceleration...", () => {
										this.space.power = -1;
										setTimeout(()=> {
											this.benson.addMessage("Landing on Targ");
										}, 3000);
									});
								}, 4000);
							});
						}, 2000);
					});
				}, 20000);
			});
		}, 5000);
	}

	startGame() {
		this.movement = new movement.Movement(this);
		this.movement.player.position.set(
			game_map.SECTOR_SIZE * START_X,
			game_map.SECTOR_SIZE * START_Y,
			START_Z);
			//movement.DEFAULT_Z);
		this.movement.startLanding();

		this.skybox = new skybox.Skybox(this.movement.player, FAR_DIST);

		this.game_map = new game_map.GameMap(this.scene, this.models, this.movement.player);

		// hack: start in a room
		//this.movement.loadGame({
		//	sectorX: 9, sectorY: 2,
		//	x: game_map.SECTOR_SIZE/2, y: game_map.SECTOR_SIZE/2, z: movement.ROOM_DEPTH,
		//	vehicle: null
		//});
	}

	setupUI() {
		let h = this.height;
		var height = (h * 0.333)|0;
		$("#ui").css({
			width: h * ASPECT_RATIO + "px",
			height: height + "px",
		});
		$(".uibox .value,#message").css("font-size", Math.round(h/200*7) + "px");
		$(".uibox").css("min-height", Math.round(h/200*7) + "px");
		let canvas_width = $("#el").width();
		let canvas_height = height - 40;

		$("#el .horiz_line").css({
			"top": ((canvas_height/2)|0) + "px",
			"width": ((canvas_width + 2)|0) + "px"
		});
		$("#comp .vert_line").css({
			"left": ((canvas_width/2)|0) + "px",
			"height": ((canvas_height/2 + 4)|0) + "px"
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
	}

	animate() {
		this.benson.update();
		if(this.movement) {
			this.game_map.update();
			this.movement.update();
		} else if(this.space) {
			this.space.update();
		}
		this.renderer.render(this.scene, this.camera);

		if(this.movement) {
			var x, y;
			if (this.movement.level) {
				x = this.movement.sectorX;
				y = this.movement.sectorY;
			} else {
				x = Math.round(this.movement.player.position.x / game_map.SECTOR_SIZE);
				y = Math.round(this.movement.player.position.y / game_map.SECTOR_SIZE);
			}
			var z = Math.round(this.movement.player.position.z) - movement.DEFAULT_Z;
			$("#loc .value").text("" + util.toHex(x, 2) + "-" + util.toHex(y, 2));
			$("#alt .value").text("" + z);
			$("#speed .value").text("" + Math.round(this.movement.getSpeed() / 100.0));
			this.compass.update(this.movement.getHeadingAngle());
			this.horizon.update(this.movement.getPitchAngle());
		} else if(this.space) {
			$("#speed .value").text("" + this.space.getSpeed());
		}

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
