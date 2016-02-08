import THREE from 'three.js'
import * as util from 'util'

export const SECTOR_SIZE = 512.0;

export const GRASS_COLOR = new THREE.Color("rgb(39,79,6)");
export const SKY_COLOR = new THREE.Color("rgb(157,161,253)");
export const STRUCTURE_COLOR = new THREE.Color(0xffffff);
export const ROAD_COLOR = new THREE.Color("rgb(132,126,133)");

const ROAD_MAT = new THREE.LineBasicMaterial({color: ROAD_COLOR, linewidth: 4});

const ROAD_Z = 1;

var key = (sectorX, sectorY) => `${sectorX}.${sectorY}`;

const MAP_POSITIONS = {
	car: [[9, 3]],
	plane: [[0x32, 0x66, 0.25, 0.15, Math.PI]],
	elevator: [[9, 2]],

	opera: [],
	asha: [[0x40, 0x43], [0x42, 0x43], [0x44, 0x43]],
	tower: [[0x41, 0x45], [0x44, 0x45]],
	port: [[0x32, 0x66]]
};

const ROAD_POSITIONS = [
	// borders
	[0, 0, 255, 0],
	[0, 0, 0, 255],
	[255, 0, 0, 255],
	[0, 255, 255, 0],
	// other roads
	[11, 0, 0, 15],
	[0, 11, 15, 0],
	[10, 4, 5, 0],

	[0x30, 0x44, 0, 0x24],
	[0x00, 0x44, 0x44, 0x00],
	[0x0a, 0x02, 0x00, 67],
	[0x30, 0x67, 0x04, 0x00],

];

export class GameMap {
	constructor(scene, models, player) {
		this.player = player;
		this.land = new THREE.Object3D();
		this.sectors = {};
		this.minSector = {x: 0, y: 0};
		this.maxSector = {x: 0, y: 0};

		// limit calcs
		this.lastSector = new THREE.Vector3();
		this.heading = new THREE.Vector3();
		this.point = new THREE.Vector3();

		// add models
		this.structures = [];
		for(let name in models.models) {
			var m = models.models[name];
			if(MAP_POSITIONS[name] && MAP_POSITIONS[name].length > 0) {
				for(let pos of MAP_POSITIONS[name]) {
					this.addStructure(m, pos);
				}
			}
		}

		// roads
		for(let road of ROAD_POSITIONS) {
			this.addRoad(...road);
		}

		this.drawRoads();

		scene.add(this.land);
	}

	addRoad(sectorX, sectorY, w, h) {
		if(w != 0 && h != 0) throw "Roads can only go in one direction.";

		for(let x = sectorX; x < sectorX + w; x++) {
			let sector = this.getSector(x, sectorY);
			sector.road[0] = 1;
		}
		for(let y = sectorY; y < sectorY + h; y++) {
			let sector = this.getSector(sectorX, y);
			sector.road[1] = 1;
		}
	}

	drawRoads() {
		let geo = new THREE.Geometry();
		for(let x = this.minSector.x; x < this.maxSector.x; x++) {
			for(let y = this.minSector.y; y < this.maxSector.y; y++) {
			    var road = this.getSector(x, y).road;
				if(road[0] == 1 && road[1] == 1) {
					GameMap.createCrossRoad(geo, x * SECTOR_SIZE, y * SECTOR_SIZE, 1);
				} else if(road[0] == 1) {
					GameMap.createRoad(geo, x * SECTOR_SIZE, y * SECTOR_SIZE, 1);
				} else if(road[1] == 1) {
					GameMap.createRoad(geo, x * SECTOR_SIZE, y * SECTOR_SIZE, 1, Math.PI/2);
				}
			}
		}

		// add as a single geo
		let roadMesh = new THREE.LineSegments(geo, ROAD_MAT);
		//roadMesh.frustumCulled = false;
		//roadMesh.position.set(0, 0, 1);
		this.land.add(roadMesh);
	}

	static createRoad(geometry, x, y, z, zrot=0) {
		if(zrot == 0) {
			geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE / 2, y + SECTOR_SIZE * -0.25, z + ROAD_Z));
			geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE / 2, y + SECTOR_SIZE * -0.25, z + ROAD_Z));
			geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE / 2, y + SECTOR_SIZE * 0.25, z + ROAD_Z));
			geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE / 2, y + SECTOR_SIZE * 0.25, z + ROAD_Z));
		} else {
			geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE / 4, y + -SECTOR_SIZE * 0.5, z + ROAD_Z));
			geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE / 4, y + SECTOR_SIZE * 0.5, z + ROAD_Z));
			geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE / 4, y + -SECTOR_SIZE * 0.5, z + ROAD_Z));
			geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE / 4, y + SECTOR_SIZE * 0.5, z + ROAD_Z));
		}
	}

	static createCrossRoad(geometry, x, y, z) {
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE/2, y + SECTOR_SIZE * -0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE/4, y + SECTOR_SIZE * -0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE/4, y + SECTOR_SIZE * -0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE/2, y + SECTOR_SIZE * -0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE/2, y + SECTOR_SIZE * 0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE/4, y + SECTOR_SIZE * 0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE/4, y + SECTOR_SIZE * 0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE/2, y + SECTOR_SIZE * 0.25, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE * 0.25, y + -SECTOR_SIZE/2, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE * 0.25, y + -SECTOR_SIZE/4, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE * 0.25, y + SECTOR_SIZE/4, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + SECTOR_SIZE * 0.25, y + SECTOR_SIZE/2, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE * 0.25, y + -SECTOR_SIZE/2, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE * 0.25, y + -SECTOR_SIZE/4, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE * 0.25, y + SECTOR_SIZE/4, z + ROAD_Z));
		geometry.vertices.push(new THREE.Vector3(x + -SECTOR_SIZE * 0.25, y + SECTOR_SIZE/2, z + ROAD_Z));
	}

	update() {
	}

	addStructure(model, pos) {
		var bb = model.getBoundingBox();
		let sectorX = pos[0];
		let sectorY = pos[1];
		let dx = pos.length > 2 ? pos[2] * SECTOR_SIZE : (SECTOR_SIZE - bb.size().x) / 2;
		let dy = pos.length > 3 ? pos[3] * SECTOR_SIZE : (SECTOR_SIZE - bb.size().y) / 2;
		let zrot = pos.length > 4 ? pos[4] : 0;
		this.addModelAt(sectorX * SECTOR_SIZE + dx, sectorY * SECTOR_SIZE + dy, model, zrot);
	}

	addModelAt(x, y, model, zRot) {
		var sx = (x/SECTOR_SIZE)|0;
		var sy = (y/SECTOR_SIZE)|0;
		var ox = x % SECTOR_SIZE;
		var oy = y % SECTOR_SIZE;

		var object = model.createObject();
		this.structures.push(object);

		object.position.set(0, 0, 0);
		object.rotation.z = zRot;
		object.position.set(ox, oy, 0);

		this.getSector(sx, sy).add(object);
	}

	getSector(sectorX, sectorY) {
		var k = key(sectorX, sectorY);
		if(this.sectors[k] == null) {
			let o = new THREE.Object3D();
			o["road"] = [0, 0];
			o.position.set(sectorX * SECTOR_SIZE, sectorY * SECTOR_SIZE, 0);
			this.sectors[k] = o;
			this.land.add(o);
			if(sectorX <= this.minSector.x) this.minSector.x = sectorX;
			if(sectorY <= this.minSector.y) this.minSector.y = sectorY;
			if(sectorX >= this.maxSector.x) this.maxSector.x = sectorX;
			if(sectorY >= this.maxSector.y) this.maxSector.y = sectorY;
		}
		return this.sectors[k];
	}
}