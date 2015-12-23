import THREE from 'three.js';
import * as opera from "structures/opera"
import * as car from "vehicles/car"
import * as plane from "vehicles/plane"

export const SECTOR_COUNT = 16;
export const SECTOR_SIZE = 512.0;

export const GRASS_COLOR = new THREE.Color("rgb(39,79,6)");
export const SKY_COLOR = new THREE.Color("rgb(157,161,253)");
export const STRUCTURE_COLOR = new THREE.Color(0xffffff);
export const ROAD_COLOR = new THREE.Color("rgb(132,126,133)");

const ROAD_MAT = new THREE.LineBasicMaterial({color: ROAD_COLOR, linewidth: 4});

var key = (sectorX, sectorY) => `${sectorX}.${sectorY}`;

export class GameMap {
	constructor(scene) {
		this.land = new THREE.Object3D();
		var mat = new THREE.MeshBasicMaterial({ color: GRASS_COLOR, wireframe: false, side: THREE.DoubleSide });
		this.plane = new THREE.Mesh(new THREE.PlaneGeometry(100000, 100000), mat);
		this.plane.position.set(SECTOR_COUNT/2 * SECTOR_SIZE, SECTOR_COUNT/2 * SECTOR_SIZE, 0);
		this.land.add(this.plane);

		this.sectors = {};
		for(let x = 0; x < SECTOR_COUNT; x++) {
			for(let y = 0; y < SECTOR_COUNT; y++) {
				let o = new THREE.Object3D();
				o["road"] = [0, 0];
				o.position.set(x * SECTOR_SIZE, y * SECTOR_SIZE, 0);
				this.sectors[key(x, y)] = o;
				this.land.add(o);
			}
		}


		// structures
		new opera.Opera((model) => {
			this.addStructure(model, 12, 12);
		});

		// roads
		this.addRoad(11, 0, 0, 15);
		this.addRoad(0, 11, 15, 0);

		this.drawRoads();

		// add some vehicles
		new car.Car((model) => {
			this.addModel(model, 10, 12, SECTOR_SIZE/2, SECTOR_SIZE/2);
		});
		new plane.Plane((model) => {
			this.addModel(model, 10, 14, SECTOR_SIZE/2, SECTOR_SIZE/2);
		});

		scene.add(this.land);
	}

	addRoad(sectorX, sectorY, w, h) {
		if(w != 0 && h != 0) throw "Roads can only go in one direction.";

		for(let x = sectorX; x < sectorX + w; x++) {
			let sector = this.sectors[key(x, sectorY)];
			sector.road[0] = 1;
		}
		for(let y = sectorY; y < sectorY + h; y++) {
			let sector = this.sectors[key(sectorX, y)];
			sector.road[1] = 1;
		}
	}

	drawRoads() {
		for(let x = 0; x < SECTOR_COUNT; x++) {
			for(let y = 0; y < SECTOR_COUNT; y++) {
			    var road = this.sectors[key(x, y)].road;
				var mesh = null;
				if(road[0] == 1 && road[1] == 1) {
					mesh = GameMap.createCrossRoad();
				} else if(road[0] == 1) {
					mesh = GameMap.createRoad();
				} else if(road[1] == 1) {
					mesh = GameMap.createRoad();
					mesh.rotation.z = Math.PI/2;
				}

				if(mesh) {
					mesh.position.set(x * SECTOR_SIZE, y * SECTOR_SIZE, 1);
					mesh.updateMatrix();
					this.land.add(mesh);
				}
			}
		}
	}

	static createRoad() {
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE/2, SECTOR_SIZE * -0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE/2, SECTOR_SIZE * -0.25, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE/2, SECTOR_SIZE * 0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE/2, SECTOR_SIZE * 0.25, 0));
		return new THREE.LineSegments(geometry, ROAD_MAT);
	}

	static createCrossRoad() {
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE/2, SECTOR_SIZE * -0.25, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE/4, SECTOR_SIZE * -0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE/4, SECTOR_SIZE * -0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE/2, SECTOR_SIZE * -0.25, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE/2, SECTOR_SIZE * 0.25, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE/4, SECTOR_SIZE * 0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE/4, SECTOR_SIZE * 0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE/2, SECTOR_SIZE * 0.25, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE * 0.25, -SECTOR_SIZE/2, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE * 0.25, -SECTOR_SIZE/4, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE * 0.25, SECTOR_SIZE/4, 0));
		geometry.vertices.push(new THREE.Vector3(SECTOR_SIZE * 0.25, SECTOR_SIZE/2, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE * 0.25, -SECTOR_SIZE/2, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE * 0.25, -SECTOR_SIZE/4, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE * 0.25, SECTOR_SIZE/4, 0));
		geometry.vertices.push(new THREE.Vector3(-SECTOR_SIZE * 0.25, SECTOR_SIZE/2, 0));
		return new THREE.LineSegments(geometry, ROAD_MAT);
	}

	update(object) {
		this.plane.position.set(object.position.x, object.position.y, 0);
	}

	addStructure(model, sectorX, sectorY) {
		var bb = model.getBoundingBox();
		var dx = (SECTOR_SIZE - bb.size().x) / 2;
		var dy = (SECTOR_SIZE - bb.size().y) / 2;
		this.addModel(model, sectorX, sectorY, dx, dy);
	}

	addModel(model, sectorX, sectorY, offsetX, offsetY) {
		model.object.position.set(offsetX, offsetY, 0);
		this.sectors[key(sectorX, sectorY)].add(model.object);
	}
}