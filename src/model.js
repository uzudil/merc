import THREE from 'three.js';
import * as game_map from 'game_map';

export class Model {
	constructor(model_file, onLoad) {
		this.mesh = null;
		var loader = new THREE.JSONLoader();
		loader.load(model_file + "?cb=" + Date.now(), (geometry) => {
			this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false }));

			this.transform();

			this.object = new THREE.EdgesHelper( this.mesh, game_map.STRUCTURE_COLOR, 7.5 );
			this.object.material.linewidth = 4;

			this.bbox = new THREE.Box3().setFromObject(this.mesh);

			onLoad(this);
		});
	}

	transform() {

	}

	getBoundingBox() {
		return this.bbox;
	}
}