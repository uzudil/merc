import THREE from 'three.js';

export class Skybox {
	constructor(scene, far_dist) {

		var path = "images/sky-";
		var format = '.png';
		var urls = [
			path + 'xpos' + format, path + 'xneg' + format,
			path + 'ypos' + format, path + 'yneg' + format,
			path + 'zpos' + format, path + 'zneg' + format
		];

		var textureCube = THREE.ImageUtils.loadTextureCube( urls, THREE.CubeRefractionMapping );

		var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = textureCube;

		var material = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		} );
		var box = new THREE.BoxGeometry( far_dist, far_dist, far_dist/2 );
		// remove bottom face
		for(let i = 0; i < box.faces.length; i++) {
			if(box.faces[i].normal.z == -1) {
				box.faces.splice(i, 1);
				break;
			}
		}
		var mesh = new THREE.Mesh( box, material );
		mesh.position.z = far_dist/4;
		scene.add( mesh );
	}
}