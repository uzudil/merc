import THREE from 'three.js';
import * as constants from 'constants';
import * as util from 'util';

export class Skybox {
	constructor(scene, far_dist) {
		/*
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
		*/

		this.material = new THREE.MeshBasicMaterial({ color: constants.SKY_COLOR, side: THREE.BackSide });
		var box = new THREE.BoxGeometry( far_dist, far_dist, far_dist/2 );
		// remove bottom face
		for(let i = 0; i < box.faces.length; i++) {
			if(box.faces[i].normal.z == -1) {
				box.faces.splice(i, 1);
				break;
			}
		}
		this.mesh = new THREE.Mesh( box, this.material );
		this.mesh.position.z = far_dist/4;
		scene.add( this.mesh );
	}

	setLightPercent(percent) {
		// todo: show stars at night - sun during day
		this.material.color = constants.SKY_COLOR.clone().multiplyScalar(percent);
		util.updateColors(this.mesh);
	}
}