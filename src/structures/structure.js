import THREE from 'three.js';

export class Structure {
	constructor() {
		this.bbox = null;
		this.object = null;
	}

	build(...meshes) {
		var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, wireframeLinewidth: 4});
		var singleGeometry = new THREE.Geometry();

		meshes.forEach((mesh) => {
			mesh.updateMatrix();
			singleGeometry.merge(mesh.geometry, mesh.matrix);
		});

		var singleMesh = new THREE.Mesh(singleGeometry, mat);

		this.object = new THREE.EdgesHelper( singleMesh, 0xffffff );
		this.object.material.linewidth = 4;

		this.bbox = new THREE.Box3().setFromObject(singleMesh);
	}

	getBoundingBox() {
		return this.bbox;
	}
}
