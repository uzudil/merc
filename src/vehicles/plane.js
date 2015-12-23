import THREE from 'three.js';
import * as model from 'model';
import * as game_map from 'game_map';

export class Plane extends model.Model {
	constructor(onLoad) {
		super("models/plane.json", onLoad);
	}

	transform() {
		this.mesh.scale.set(60, 60, 60);
		this.mesh.position.z = 1;
		this.mesh.rotation.x = Math.PI/2;
	}
}