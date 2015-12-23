import THREE from 'three.js';
import * as model from 'model';
import * as game_map from 'game_map';

export class Car extends model.Model {
	constructor(onLoad) {
		super("models/car.json", onLoad);
	}

	transform() {
		this.mesh.scale.set(25, 25, 25);
		this.mesh.position.z = 1;
		this.mesh.rotation.x = Math.PI/2;
	}
}