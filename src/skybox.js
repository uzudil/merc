import THREE from 'three.js';
import * as constants from 'constants';
import * as util from 'util';

export class Skybox {
	constructor(player, far_dist) {
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
		player.add( this.mesh );

		// add some stars
		this.stars = new THREE.Object3D();
		this.starMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(240,220,16)"), opacity: 0, transparent: true });
		for(let i = 0; i < 1000; i++) {
			let r = (far_dist * 0.35) + (Math.random() * .1);
			let a = Math.random() * Math.PI * 2;
			let b = Math.random() * Math.PI / 2;
			let x = r * Math.cos(a) * Math.sin(b);
			let y = r * Math.sin(a) * Math.sin(b);
			let z = r * Math.cos(b);
			let size = Math.random() * 70 + 70;
			let star = new THREE.Mesh(new THREE.BoxGeometry( size, size, size ), this.starMaterial);
			star.position.set(x, y, z);
			this.stars.add(star);
		}
		player.add(this.stars);

		// todo: adding sun/moon is tricky since there is no 'ground'
	}

	update(zRot) {
		this.stars.rotation.z = -zRot;
	}

	setLightPercent(percent) {
		// show stars at night - sun during day
		this.material.color = constants.SKY_COLOR.clone().multiplyScalar(percent);
		util.updateColors(this.mesh);
		for(let star of this.stars.children) {
			star.material.opacity = 1 - percent;
			util.updateColors(star);
		}
	}
}