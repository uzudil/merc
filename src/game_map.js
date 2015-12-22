import THREE from 'three.js';
import * as opera from "structures/opera"
import * as pyramid from "structures/pyramid"

export const SECTOR_COUNT = 64;
export const SECTOR_SIZE = 128.0;

var key = (sectorX, sectorY) => `${sectorX}.${sectorY}`;

export class GameMap {
	constructor(scene) {
		this.land = new THREE.Object3D();
		var mat = new THREE.MeshBasicMaterial({ color: 0x008800, wireframe: false, side: THREE.DoubleSide });
		this.plane = new THREE.Mesh(new THREE.PlaneGeometry(100000, 100000), mat);
		this.plane.position.set(SECTOR_COUNT/2 * SECTOR_SIZE, SECTOR_COUNT/2 * SECTOR_SIZE, 0);
		this.land.add(this.plane);

		this.sectors = {};
		for(let x = 0; x < SECTOR_COUNT; x++) {
			for(let y = 0; y < SECTOR_COUNT; y++) {
				let o = new THREE.Object3D();
				o.position.set(x * SECTOR_SIZE, y * SECTOR_SIZE, 0);
				this.sectors[key(x, y)] = o;
				this.land.add(o);
			}
		}
		scene.add(this.land);

		this.addStructure(new opera.Opera(), 25, 25);
		this.addStructure(new pyramid.Pyramid(), 25, 20);
	}

	update(object) {
		this.plane.position.set(object.position.x, object.position.y, 0);
	}

	addStructure(structure, sectorX, sectorY) {
		var bb = structure.getBoundingBox();
		var dx = (SECTOR_SIZE - bb.size().x) / 2;
		var dy = (SECTOR_SIZE - bb.size().y) / 2;
		structure.object.position.set(dx, dy, 0);
		this.sectors[key(sectorX, sectorY)].add(structure.object);
	}
}