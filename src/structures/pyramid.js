import THREE from 'three.js';
import * as structure from 'structures/structure';

export class Pyramid extends structure.Structure {
	constructor() {
		super();

		var geo = new THREE.TetrahedronGeometry(70);
		var mesh = new THREE.Mesh( geo, null );
		mesh.position.z = 35;

		this.build(mesh);
	}
}