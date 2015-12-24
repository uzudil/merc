import THREE from 'three.js'

export const SECTOR_SIZE = 512.0;

export const GRASS_COLOR = new THREE.Color("rgb(39,79,6)");
export const SKY_COLOR = new THREE.Color("rgb(157,161,253)");
export const STRUCTURE_COLOR = new THREE.Color(0xffffff);
export const ROAD_COLOR = new THREE.Color("rgb(132,126,133)");

const ROAD_MAT = new THREE.LineBasicMaterial({color: ROAD_COLOR, linewidth: 4});

var key = (sectorX, sectorY) => `${sectorX}.${sectorY}`;

const MAP_POSITIONS = {
	opera: [[12, 12], [14, 12]],
	asha: [[10, 10], [12, 10], [14, 10]],
	car: [[10, 12]],
	plane: [[10, 14]]
};

export class GameMap {
	constructor(scene, models) {
		this.land = new THREE.Object3D();
		var mat = new THREE.MeshBasicMaterial({ color: GRASS_COLOR, wireframe: false, side: THREE.DoubleSide });
		this.plane = new THREE.Mesh(new THREE.PlaneGeometry(100000, 100000), mat);
		this.plane.position.set(10 * SECTOR_SIZE, 10 * SECTOR_SIZE, 0);
		this.land.add(this.plane);

		this.sectors = {};
		this.minSector = {x: 0, y: 0};
		this.maxSector = {x: 0, y: 0};

		// add models
		for(let name in models.models) {
			var m = models.models[name];
			for(let [sx, sy] of MAP_POSITIONS[name]) {
				this.addStructure(m, sx, sy);
			}
		}

		// roads
		this.addRoad(11, 0, 0, 15);
		this.addRoad(0, 11, 15, 0);

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
		var m = model.createObject();
		m.position.set(offsetX, offsetY, 0);
		this.getSector(sectorX, sectorY).add(m);
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