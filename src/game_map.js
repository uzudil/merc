import THREE from 'three.js'
import * as room from 'room'

export const SECTOR_SIZE = 1024.0;

export const GRASS_COLOR = new THREE.Color("rgb(39,79,6)");
export const SKY_COLOR = new THREE.Color("rgb(157,161,253)");
export const STRUCTURE_COLOR = new THREE.Color(0xffffff);
export const ROAD_COLOR = new THREE.Color("rgb(132,126,133)");

const ROAD_MAT = new THREE.LineBasicMaterial({color: ROAD_COLOR, linewidth: 4});

var key = (sectorX, sectorY) => `${sectorX}.${sectorY}`;

const MAP_POSITIONS = {
	opera: [[12, 12], [14, 12], [1, 1], [1, 2]],
	asha: [[10, 10], [12, 10], [14, 10]],
	car: [[10, 12], [9, 3]],
	plane: [[10, 14], [9, 2]],
	tower: [[9, 1], [11, -19], [11, -18]],
	elevator: [[9, 2]]
};

const ROAD_POSITIONS = [
	[11, 0, 0, 15],
	[0, 0, 15, 0],
	[0, 11, 15, 0],
	[0, 0, 0, 15],
	[10, -20, 0, 25],
	[10, 4, 5, 0]
];

const COMPOUNDS = {
	"9,2": new room.Level({
		_start_: new room.Room("_start_", 4, 4, "#eeddd8", "#cc8800", { n: "meeting_room", e: "bunks" }, true),
		meeting_room: new room.Room("meeting_room", 2, 6, "#d8ddee", "#88cc00"),
		bunks: new room.Room("bunks", 3, 9, "#ddeed8", "#0000cc")
	})
};

export class GameMap {
	constructor(scene, models, player) {
		this.player = player;
		this.land = new THREE.Object3D();
		var mat = new THREE.MeshBasicMaterial({ color: GRASS_COLOR, wireframe: false, side: THREE.FrontSide });
		this.plane = new THREE.Mesh(new THREE.PlaneGeometry(200000, 200000), mat);
		this.plane.position.set(10 * SECTOR_SIZE, 10 * SECTOR_SIZE, 0);
		this.land.add(this.plane);

		this.sectors = {};
		this.minSector = {x: 0, y: 0};
		this.maxSector = {x: 0, y: 0};

		// add models
		this.structures = [];
		for(let name in models.models) {
			var m = models.models[name];
			for(let [sx, sy] of MAP_POSITIONS[name]) {
				this.addStructure(m, sx, sy);
			}
		}

		// roads
		for(let road of ROAD_POSITIONS) {
			this.addRoad(...road);
		}

		this.drawRoads();

		scene.add(this.land);
	}

	getRoom(sectorX, sectorY) {
		var key = "" + sectorX + "," + sectorY;
		return COMPOUNDS[key] ? COMPOUNDS[key].getRoom("_start_") : null;
	}

	getLevel(sectorX, sectorY) {
		return COMPOUNDS["" + sectorX + "," + sectorY];
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
		for(let x = this.minSector.x; x < this.maxSector.x; x++) {
			for(let y = this.minSector.y; y < this.maxSector.y; y++) {
			    var road = this.getSector(x, y).road;
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

	update() {
		this.plane.position.set(this.player.position.x, this.player.position.y, 0);
	}

	addStructure(model, sectorX, sectorY) {
		var bb = model.getBoundingBox();
		var dx = (SECTOR_SIZE - bb.size().x) / 2;
		var dy = (SECTOR_SIZE - bb.size().y) / 2;
		this.addModelAt(sectorX * SECTOR_SIZE + dx, sectorY * SECTOR_SIZE + dy, model, 0);
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