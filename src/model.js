import THREE from 'three.js';
import * as game_map from 'game_map';

const MODELS = [ "opera", "asha", "car", "plane" ];

const VEHICLES = {
	"car": { speed: 100, flies: false },
	"plane": { speed: 1000, flies: true }
};

//const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, wireframeLinewidth: 4 });
const MATERIAL = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	side: THREE.doubleSided,
	vertexColors: THREE.FaceColors,
	overdraw: true
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
	}

	load(onLoad) {
		var loader = new THREE.JSONLoader();
		loader.load("models/" + this.name + ".json?cb=" + Date.now(), (geometry) => {

			// put the geom. on the ground
			geometry.center();
			geometry.rotateX(Math.PI/2);
			geometry.rotateZ(Math.PI/2);
			geometry.translate(0, 0, geometry.boundingBox.size().z/2 + 1/60);
			geometry.scale(60, 60, 60);

			// cheap/fake per-face shading
			for (var i = 0; i < geometry.faces.length; i++) {
				let f = geometry.faces[i];
				let a = 0.75 + f.normal.dot(LIGHT) * 0.25;
				f.color.setRGB(a, a, a);
			}

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
