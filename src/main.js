import THREE from 'three.js'
import Stats from 'stats.js'
import * as game_map from 'game_map'
import $ from 'jquery'
import * as util from 'util'
import * as movement from 'movement'
import * as skybox from "skybox"
import * as model from 'model'
import * as compass from 'compass'
import * as benson from 'benson'
import * as space from 'space'
import * as events from 'events'
import * as constants from 'constants'

const FPS_LIMITS = [ 0, 30, 15 ];
const ASPECT_RATIO = 320/200;
const FAR_DIST = 100000;
const MORNING = 4;
const EVENING = 17;
const LIGHT_CHANGE_HOURS = 3;

const VERSION = 0.4; // todo: git hook this

class Merc {
	constructor() {
		console.log(`Merc (c) 2016 v${VERSION}`);

		let h = window.innerHeight * .75;
		let w = h * ASPECT_RATIO;
		$("#title").css({
			width: w + "px",
			height: h + "px"
		});
		$("#version").empty().append("v" + VERSION);

		window.escapeUsed = false;
		this.lastLightPercent = 0;
		this.updateLight = true;
		this.tmpColor = new THREE.Color();
		window.cb = "" + VERSION;

		util.initBinaryLoader();

		new model.Models((models) => {
			this.init(models);

			this._game_map = new game_map.GameMap(this.scene, this.models, this.renderer.getMaxAnisotropy());
			util.execWithProgress([
				() => this._game_map.initModels(),
				() => this._game_map.compressSectors(),
				() => this._game_map.addXenoBase(),
				() => this._game_map.addRoads(),
				() => this._game_map.finishInit(),
				() => {
					$("#title .start").show();
					$(document).keydown(( event ) => {
						$(document).unbind("keydown");
						this.setupUI();
						//this.startGame();
						//this.startGame(true);
						this.startIntro();
						this.animate();
					});
				}
			], "wait-world");
		});
	}

	init(models) {
		this.fpsLimitIndex = 0;
		window.models = this.models = models;
		this.camera = new THREE.PerspectiveCamera( 65, ASPECT_RATIO, 1, FAR_DIST );

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer();
		this.height = window.innerHeight * .75;
		this.renderer.setSize( this.height * ASPECT_RATIO, this.height );

		this.benson = new benson.Benson();

		this.space = null;
		this.movement = null;
	}

	startIntro() {
		let skipping = false;
		$(document).keyup(( event ) => {
			if(event.keyCode == 27 && window.escapeUsed == false && constants.DEV_MODE) {
				window.escapeUsed = true; // only once
				if(!skipping) {
					skipping = true;
					this.space.abort();
				}
			} else if(event.keyCode == 70) {
				this.incrFpsLimit();
			}
		});
		this.space = new space.Space(this.scene, this);
		window.setTimeout(()=>{
			if(skipping) return;
			this.benson.addMessage("Set course to Novagen...");
			this.benson.addMessage("Engaging Hyperdrive", () => {
				if(skipping) return;
				//this.space.power = 1;
				this.space.burn(1, 15000);
				this.benson.addMessage("Enjoy your trip.");
				window.setTimeout(() => {
					if(skipping) return;
					this.benson.addMessage("Message received.");
					this.benson.addMessage("Sender: Targ city.");
					this.benson.addMessage("Priority: urgent.", ()=> {
						window.setTimeout(()=>{
							if(skipping) return;
							this.benson.addMessage("Request for assistance.");
							this.benson.addMessage("Targ city emergency.");
							this.benson.addMessage("Immediate help requested.", ()=> {
								setTimeout(()=> {
									if(skipping) return;
									this.benson.addMessage("Starting deceleration...", () => {
										//this.space.power = -1;
										this.space.burn(-1, 7500);
										setTimeout(()=> {
											if(skipping) return;
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

	startGame(skipLanding=false) {
		console.log("game starting");
		// this.scene.fog = new THREE.Fog(constants.GRASS_COLOR.getHex(), 50 * constants.SECTOR_SIZE, 50 * constants.SECTOR_SIZE);
		// lights
		this.ambientLight = new THREE.AmbientLight( constants.AMBIENT_COLOR.getHex() );
		this.scene.add(this.ambientLight);

		this.dirLight1 = new THREE.DirectionalLight( constants.DIR1_COLOR.getHex(), 0.4 );
		this.dirLight1.position.set( 1, 1, .8 );
		this.scene.add( this.dirLight1 );

		this.dirLight2 = new THREE.DirectionalLight( constants.DIR2_COLOR.getHex(), 0.25 );
		this.dirLight2.position.set(-.8, 1, -.5 );
		this.scene.add( this.dirLight2 );

		//window.light1 = this.dirLight1;
		//window.light2 = this.dirLight2;
		//window.ambient = this.ambientLight;

		this.renderer.setClearColor(constants.GRASS_COLOR);
		this.movement = new movement.Movement(this);

		this.game_map = this._game_map;

		// maybe use real planet movement instead
		this.skybox = new skybox.Skybox(this.movement.player, FAR_DIST);

		this.movement.player.position.set(
			constants.SECTOR_SIZE * constants.START_X + constants.SECTOR_SIZE / 2,
			constants.SECTOR_SIZE * constants.START_Y,
			skipLanding ? movement.DEFAULT_Z : constants.START_Z);
		if (skipLanding) {
			this.movement.endLanding();
		} else {
			this.movement.startLanding();
		}

		// hack: start in a room
		// by the xeno base
		//this.movement.loadGame({
		//	sectorX: 0xf8, sectorY: 0xc9,
		//	//sectorX: 9, sectorY: 2,
		//	//x: constants.SECTOR_SIZE/2, y: constants.SECTOR_SIZE/2, z: movement.ROOM_DEPTH,
		//	x: constants.SECTOR_SIZE / 2, y: constants.SECTOR_SIZE / 2, z: 10000,
		//	vehicle: this.models.models["ufo"].createObject(),
		//	inventory: ["keya", "keyb", "keyc", "keyd", "art", "art2", "trans", "core"],
		//	state: Object.assign(events.Events.getStartState(), {
		//		"lightcar-keys": true,
		//		"override-17a": true,
		//		"next-game-day": Date.now() + constants.GAME_DAY * 0.25,
		//	})
		//});

		// by a base
		//this.movement.loadGame({
		//	sectorX: 0xd9, sectorY: 0x42,
		//	//sectorX: 9, sectorY: 2,
		//	x: constants.SECTOR_SIZE/2, y: constants.SECTOR_SIZE/2, z:movement.DEFAULT_Z,
		//	vehicle: null,
		//	inventory: ["keya", "keyb", "keyc", "keyd", "art", "art2", "trans", "core"],
		//	state: Object.assign(events.Events.getStartState(), {
		//		"lightcar-keys": true,
		//		"override-17a": true,
		//		"next-game-day": Date.now() + constants.GAME_DAY * 0.65,
		//	})
		//});


		// inside
		//this.movement.loadGame({
		//	sectorX: 0xd9, sectorY: 0x42,
		//	//sectorX: 9, sectorY: 2,
		//	x: constants.SECTOR_SIZE/2, y: constants.SECTOR_SIZE/2, z:movement.ROOM_DEPTH,
		//	vehicle: null,
		//	inventory: ["keya", "keyb", "keyc", "keyd", "art", "art2", "trans", "core"],
		//	state: Object.assign(events.Events.getStartState(), {
		//		"lightcar-keys": true,
		//		"override-17a": true,
		//		"next-game-day": Date.now() + constants.GAME_DAY * 0.65,
		//	})
		//});
	}

	setupUI() {

		if(constants.DEV_MODE) {
			this.statsFPS = new Stats();
			this.statsFPS.setMode(0); // 0: fps, 1: ms, 2: mb
			this.statsFPS.domElement.style.position = 'absolute';
			this.statsFPS.domElement.style.left = '0px';
			this.statsFPS.domElement.style.top = '0px';
			document.body.appendChild(this.statsFPS.domElement);

			this.statsMB = new Stats();
			this.statsMB.setMode(2); // 0: fps, 1: ms, 2: mb
			this.statsMB.domElement.style.position = 'absolute';
			this.statsMB.domElement.style.left = '0px';
			this.statsMB.domElement.style.top = '50px';
			document.body.appendChild(this.statsMB.domElement);
		}

		$("#title-container").hide();
		$("#ui").show();

		window.loadingComplex = false;

		let h = this.height;
		var height = (h * 0.333)|0;
		let w = h * ASPECT_RATIO;
		$("#ui").css({
			width: w + "px",
			height: height + "px",
			left: "50%",
			"margin-left": -w/2 + "px"
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

	incrFpsLimit() {
		this.fpsLimitIndex++;
		if(this.fpsLimitIndex >= FPS_LIMITS.length) this.fpsLimitIndex = 0;
		console.log("FPS LIMIT at: ", FPS_LIMITS[this.fpsLimitIndex]);
	}

	setLightPercent() {
		let percent = this.movement.level == null ? this.calculateOutsideLightPercent() : 1;
		this.setLightPercentWorld(percent);
	}

	calculateOutsideLightPercent() {
		// less linear daylight function... (dark: 8pm-4am, light: 7am-5pm, transitions otherwise)
		let hour = this.movement.events.hourOfDay;
		let p;
		if(hour >= MORNING && hour <= MORNING + LIGHT_CHANGE_HOURS) {
			p = (hour - MORNING)/(LIGHT_CHANGE_HOURS);
		} else if(hour >= EVENING && hour <= EVENING + LIGHT_CHANGE_HOURS) {
			p = 1 - ((hour - EVENING) / (LIGHT_CHANGE_HOURS));
		} else if(hour > MORNING + LIGHT_CHANGE_HOURS && hour < EVENING) {
			p = 1;
		} else if(hour > EVENING + LIGHT_CHANGE_HOURS || hour < MORNING) {
			p = 0
		} else {
			console.log("+++ unhandled hour: " + hour);
		}
		return Math.max(constants.MIN_LIGHT, p);
	}

	setLightPercentWorld(percent) {
		if(((percent * 100)|0) !== ((this.lastLightPercent * 100)|0)) {
			this.lastLightPercent = percent;
			//console.log("SETTING LIGHT: Hour of day=" + this.movement.events.hourOfDay + " percent=" + percent);
			this.renderer.setClearColor(constants.GRASS_COLOR.clone().multiplyScalar(percent));
			this.skybox.setLightPercent(percent);
		}

		// just dim
		this.dirLight1.color.set(constants.DIR1_COLOR.getHex()).multiplyScalar(percent * .5 + .5);
		this.dirLight2.color.set(constants.DIR2_COLOR.getHex()).multiplyScalar(percent * .5 + .5);

		// cycle thru a dawn/dusk color set
		constants.calcLight(this.movement.events.hourOfDay, this.tmpColor, constants.AMBIENT_COLOR);

		// adjust light color for inside
		if(this.movement.level) {
			if(this.movement.liftDirection != 0) {
				this.tmpColor.r = this.tmpColor.r + (0.6 - this.tmpColor.r) * percent;
				this.tmpColor.g = this.tmpColor.g + (0.6 - this.tmpColor.g) * percent;
				this.tmpColor.b = this.tmpColor.b + (0.6 - this.tmpColor.b) * percent;
			} else {
				this.tmpColor.r = this.tmpColor.g = this.tmpColor.b = 0.6;
			}
		}

		if(this.tmpColor.getHex() != this.ambientLight.color.getHex()) {
			this.ambientLight.color.setHex(this.tmpColor.getHex())
		}

	}

	animate() {
		if(constants.DEV_MODE) {
			this.statsFPS.begin();
			this.statsMB.begin();
		}

		this.benson.update();
		if(this.movement && this.game_map) {
			this.movement.update();
			this.skybox.update(this.movement.player.rotation.z);

			// update skybox/sun/moon/stars position darkness via this.movement.events.hourOfDay
			if(this.updateLight) {
				this.setLightPercent();
			}

		} else if(this.space) {
			this.space.update();
		}
		this.renderer.render(this.scene, this.camera);

		if(this.movement && this.game_map) {
			var x, y;
			if (this.movement.level) {
				x = this.movement.sectorX;
				y = this.movement.sectorY;
			} else {
				x = Math.round(this.movement.player.position.x / constants.SECTOR_SIZE);
				y = Math.round(this.movement.player.position.y / constants.SECTOR_SIZE);
				x = Math.min(Math.max(x, 0), 0xff);
				y = Math.min(Math.max(y, 0), 0xff);
			}
			var z = Math.round(this.movement.player.position.z) - movement.DEFAULT_Z;
			$("#loc .value").text("" + util.toHex(x, 2) + "-" + util.toHex(y, 2));
			$("#alt .value").text("" + z);
			$("#speed .value").text("" + Math.round(this.movement.getSpeed() / 100.0));
			$("#time .value").text("" + (11 - this.movement.events.state["allitus-ttl"]) + "-" + this.getAMPMHour());
			this.compass.update(this.movement.getHeadingAngle());
			this.horizon.update(this.movement.getPitchAngle());
		} else if(this.space) {
			$("#speed .value").text("" + this.space.getSpeed());
		}

		if(constants.DEV_MODE) {
			this.statsFPS.end();
			this.statsMB.end();
		}

		if(FPS_LIMITS[this.fpsLimitIndex] != 0) {
			setTimeout(()=> {
				requestAnimationFrame(util.bind(this, this.animate));
			}, 1000/FPS_LIMITS[this.fpsLimitIndex]);
		} else {
			requestAnimationFrame(util.bind(this, this.animate));
		}
	}

	getAMPMHour() {
		let hour = (this.movement.events.hourOfDay)|0;
		if(hour >= 0 && hour < 12) {
			return hour + "AM";
		} else if(hour == 12) {
			return hour + "PM";
		} else {
			return (hour - 12) + "PM";
		}
	}
}

$(document).ready(function() {
	window.merc = new Merc();
});
