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
		} ),
		mesh = new THREE.Mesh( new THREE.BoxGeometry( far_dist, far_dist, far_dist/2 ), material );
		mesh.position.z = far_dist/4;
		scene.add( mesh );
	}
}