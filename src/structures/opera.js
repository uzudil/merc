import THREE from 'three.js';
import * as structure from 'structures/structure';

export class Opera extends structure.Structure {
	constructor() {
		super();

		var box1 = new THREE.BoxGeometry(100, 100, 100);
		var mesh1 = new THREE.Mesh( box1, null );
		mesh1.position.z = 50;

		var box2 = new THREE.BoxGeometry(70, 70, 70);
		var mesh2 = new THREE.Mesh(box2, null );
		mesh2.position.set(-50 - 35, 0, 35);

		var box3 = new THREE.BoxGeometry(70, 70, 70);
		var mesh3 = new THREE.Mesh(box3, null );
		mesh3.position.set(50 + 35, 0, 35);

		this.build(mesh1, mesh2, mesh3);
	}
}