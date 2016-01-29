import THREE from 'three.js';
import * as game_map from 'game_map';
import * as util from 'util';

/*
	To use colors, use the "vertex paint" feature of blender.
	Then, export with vertex colors on (no materials needed.)
 */
const MODELS = [ "opera", "asha", "car", "plane", "tower", "elevator",
	"keya", "keyb", "keyc", "keyd" ];

const VEHICLES = {
	"car": { speed: 4000, flies: false },
	"plane": { speed: 20000, flies: true }
};

const SCALE = {
	"car": 20,
	"plane": 20,
	"keya": 10,
	"keyb": 10,
	"keyc": 10,
	"keyd": 10,
};

const DESCRIPTIONS = {
	"keya": "Pentagon key",
	"keyb": "Triangle key",
	"keyc": "Gate key",
	"keyd": "X key"
}

//const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, wireframeLinewidth: 4 });
const MATERIAL = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
	vertexColors: THREE.FaceColors
	//overdraw: true
});
const LIGHT = new THREE.Vector3(0.5, 0.75, 1.0);

export class Models {
	constructor(onLoad) {
		this.onLoad = onLoad;
		this.models = {};
		for(let name of MODELS) {
			let model;
			if(name in VEHICLES) {
				model = new Vehicle(name, VEHICLES[name].speed, VEHICLES[name].flies);
			} else {
				model = new Model(name);
			}
			model.load((m) => this.modelLoaded(m));
		}
	}

	modelLoaded(model) {
		console.log("Model loaded: " + model);
		this.models[model.name] = model;
		if(Object.keys(this.models).length == MODELS.length) {
			this.onLoad(this);
		}
	}
}

export class Model {
	constructor(name) {
		this.name = name;
		this.mesh = null;
		this.bbox = null;
		this.description = DESCRIPTIONS[name] || name;
	}

	load(onLoad) {
		var loader = new THREE.JSONLoader();
		loader.load("models/" + this.name + ".json?cb=" + Date.now(), (geometry, materials) => {

			// put the geom. on the ground
			geometry.center();
			geometry.rotateX(Math.PI/2);
			geometry.rotateZ(Math.PI/2);
			geometry.translate(0, 0, geometry.boundingBox.size().z/2 + 1/60);
			let scale = SCALE[this.name] || 60;
			geometry.scale(scale, scale, scale);
			util.shadeGeo(geometry, LIGHT);
			this.mesh = new THREE.Mesh(geometry, MATERIAL);
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
}

export class Vehicle extends Model {
	constructor(name, speed, flies) {
		super(name);
		this.speed = speed;
		this.flies = flies;
	}
}
