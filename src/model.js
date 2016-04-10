import THREE from 'three.js';
import * as game_map from 'game_map';
import * as util from 'util';
import * as constants from 'constants';

/*
	To use colors, use the "vertex paint" feature of blender.
	Then, export with vertex colors on (no materials needed.)
 */
const MODELS = [
	"opera", "asha", "car", "plane", "tower", "elevator",
	"keya", "keyb", "keyc", "keyd", "ship", "port", "pres", "light",
	"ruins", "tower2", "bldg", "bridge", "plant", "term",
	"disk", "stadium", "art", "art2", "ufo", "allitus", "xeno",
	"xenterm", "trans", "control", "engine", "core", "pine",
	"mill"
];

const VEHICLES = {
	"car": { speed: 4000, flies: false, exp: false, noise: "car", hovers: false },
	"plane": { speed: 20000, flies: true, exp: false, noise: "jet", hovers: false },
	"ufo": { speed: 40000, flies: true, exp: true, noise: "ufo", hovers: true,
		onEnter: (movement)=> {
			if(movement.inInventory("art") && movement.inInventory("art2")) {
				if(!movement.events.state["ufo-first"]) {
					movement.main.benson.addMessage("The xeno artifacts");
					movement.main.benson.addMessage("started the craft!");
					movement.main.benson.addMessage("Try take-off and turns");
					movement.main.benson.addMessage("without moving first.");
					movement.events.state["ufo-first"] = true;
				}
				return true;
			} else {
				movement.main.benson.addMessage("This craft seems broken.");
				return false;
			}
		}
	},
	"ship": { speed: 5000000, flies: true, exp: true, noise: "pink", hovers: true,
		onEnter: (movement)=> {
			// can't depart until either: allitus is stopped, or the xeno base left
			if(!movement.events.state["allitus_control"] || movement.events.state["xeno_base_depart"]) {
				setTimeout(()=> {
					movement.main.benson.addMessage("Preparing for takeoff...", ()=> {
						movement.main.benson.addMessage("3...", ()=> {
							movement.main.benson.addMessage("2...", ()=> {
								movement.main.benson.addMessage("1...", ()=> {
									movement.main.benson.addMessage("Blastoff!", ()=> {
										movement.startTakeoff();
									});
								});
							});
						});
					});
				}, 500);
				return true;
			} else {
				movement.main.benson.addMessage("Until you complete");
				movement.main.benson.addMessage("your mission, your");
				movement.main.benson.addMessage("ship remains locked.");
				return false;

			}

		}
	},
	"light": { speed: 50000, flies: false, exp: true, noise: "car", hovers: false,
		onEnter: (movement)=> {
			return movement.events.state["lightcar-keys"];
		}
	}
};

const SCALE = {
	"car": 20,
	"light": 10,
	"plane": 20,
	"keya": 10,
	"keyb": 10,
	"keyc": 10,
	"keyd": 10,
	"ship": 20,
	"pres": 15,
	"elevator": 30,
	"tower2": 80,
	"plant": 80,
	"term": 15,
	"disk": 20,
	"art": 20,
	"art2": 20,
	"ufo": 20,
	"allitus": 15,
	"xenterm": 8,
	"trans": 10,
	"control": 10,
	"engine": 15,
	"core": 10,
	"pine": 50
};

const DESCRIPTIONS = {
	"keya": "Pentagon key",
	"keyb": "Triangle key",
	"keyc": "Gate key",
	"keyd": "X key",
	"car": "Tando groundcar",
	"plane": "Harris skipjet",
	"ship": "Templar class cruiser",
	"light": "Pulsar lightcar",
	"disk": "Emergency Override Disk",
	"art": "Xeno artifact",
	"art2": "Xeno artifact",
	"ufo": "Alien craft A3",
	"trans": "Xeno translator chip",
	"core": "Plasma drive core"
};

const LIFTS = {
	bridge: true
};

export class Models {
	constructor(onLoad) {
		this.onLoad = onLoad;
		this.models = {};
		util.startLoadingUI("wait-models");

		for(let name of MODELS) {
			let model;
			if(name in VEHICLES) {
				model = new Vehicle(name, VEHICLES[name]);
			} else {
				model = new Model(name, name !== "elevator");
			}
			model.load((m) => {
				console.log("Model loaded: " + model);
				this.models[model.name] = model;
				util.setLoadingUIProgress(Object.keys(this.models).length / MODELS.length);
				if(Object.keys(this.models).length == MODELS.length) {
					util.stopLoadingUI();
					this.onLoad(this);
				}
			});
		}
	}
}

export class Model {
	constructor(name, canCompress) {
		this.name = name;
		this.lifts = LIFTS[name];
		this.mesh = null;
		this.bbox = null;
		this.description = DESCRIPTIONS[name] || name;
		this.canCompress = canCompress;
	}

	load(onLoad) {
		var loader = new THREE.JSONLoader();
		loader.load("models/" + this.name + ".json?cb=" + window.cb, (geometry, materials) => {

			// compress the model a bit by removing stuff we don't need
			util.compressGeo(geometry);

			if(this.name == "control") {
				for (let face of geometry.faces) {
					face["original_color"] = face.color.getHex();
				}
			}

			// put the geom. on the ground
			geometry.center();
			geometry.rotateX(Math.PI/2);
			geometry.rotateZ(Math.PI/2);
			geometry.translate(0, 0, geometry.boundingBox.size().z/2 + 1/60);
			let scale = SCALE[this.name] || 60;
			geometry.scale(scale, scale, scale);
			this.mesh = new THREE.Mesh(geometry, constants.MATERIAL);
			this.bbox = new THREE.Box3().setFromObject(this.mesh);
			onLoad(this);
		});
	}

	getBoundingBox() {
		return this.bbox;
	}

	createObject() {
		var m = this.mesh.clone();
		m["model"] = this;
		return m;
	}

	hasBB() {
		return !this.canCompress;
	}
}

export class Vehicle extends Model {
	constructor(name, vehicle) {
		super(name);
		this.speed = vehicle.speed;
		this.flies = vehicle.flies;
		this.exp = vehicle.exp;
		this.noise = vehicle.noise;
		this.vehicle = vehicle;
		this.canCompress = false;
	}

	enterCheck(movement) {
		return this.vehicle.onEnter ? this.vehicle.onEnter(movement) : true;
	}

	hasBB() {
		return true;
	}
}
