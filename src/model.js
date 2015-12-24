import THREE from 'three.js';
import * as game_map from 'game_map';

const MODELS = [ "opera", "asha", "car", "plane" ];

export class Models {
	constructor(onLoad) {
		this.onLoad = onLoad;
		this.models = {};
		for(let name of MODELS) {
			new Model(name, (model) => this.modelLoaded(model));
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
	constructor(name, onLoad) {
		this.name = name;
		this.mesh = null;
		var loader = new THREE.JSONLoader();
		loader.load("models/" + name + ".json?cb=" + Date.now(), (geometry) => {
			this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false }));
			this.transform();
			this.bbox = new THREE.Box3().setFromObject(this.mesh);
			onLoad(this);
		});
	}

	transform() {
		this.mesh.scale.set(60, 60, 60);
		this.mesh.position.z = 1;
		this.mesh.rotation.x = Math.PI/2;
	}

	getBoundingBox() {
		return this.bbox;
	}

	createObject() {
		var m = this.mesh.clone();
		m["model"] = this;
		var object = new THREE.EdgesHelper( m, game_map.STRUCTURE_COLOR, 7.5 );
		object.material.linewidth = 4;
		return object;
	}
}