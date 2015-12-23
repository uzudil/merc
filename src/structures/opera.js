import THREE from 'three.js';
import * as model from 'model';

export class Opera extends model.Model {
	constructor(onLoad) {
		super("models/opera.json", onLoad);
	}

	transform() {
		this.mesh.scale.set(60, 60, 60);
		this.mesh.position.z = 1;
		this.mesh.rotation.x = Math.PI/2;
	}
}