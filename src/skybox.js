import THREE from 'three.js';

export class Skybox {
	constructor(scene) {

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
		mesh = new THREE.Mesh( new THREE.BoxGeometry( 3000, 3000, 3000 ), material );
		scene.add( mesh );
	}
}