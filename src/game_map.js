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
	car:      [[0xc9, 0xc3]],
	plane:    [[0x32, 0x66, 0.25, 0.15, Math.PI], [0xc8, 0xf0]],
	elevator: [[0x09, 0x02], [0xd9, 0x42], [0xc8, 0xf0, 0, 0, Math.PI]],
	light:    [[0x09, 0x03]],
	ruins:    [[0xda, 0x42]],
	opera:    [[0x01, 0x01], [0x01, 0xfe], [0xfe, 0x01], [0xfe, 0xfe]],
	asha:     [[0x40, 0x43], [0x42, 0x43], [0x44, 0x43]],
	tower:    [[0x41, 0x45], [0x44, 0x45], [0xc7, 0xf1]],
	port:     [[0x32, 0x66]],
	tower2:   [[0x87, 0x89], [0x89, 0x87, 0, 0, Math.PI], [0x8b, 0x89], [0xcc, 0xce], [0xce, 0xcc]],
	bldg:     [[0xcc, 0xcc, 0, 0, Math.PI / 4], [0xc8 ,0xf1, 0, 0, -Math.PI/6], [0xc9, 0xf0, 0, 0, -Math.PI/4]],
};

// [x, y, w, h, [bridges]]
const ROAD_POSITIONS = [
	// borders
	[0x00, 0x00, 0x100, 0x00],
	[0x00, 0x00, 0x00, 0x100],
	[0xff, 0x00, 0x00, 0x100],
	[0x00, 0xff, 0x100, 0x00],

	// other roads
	[0x0a, 0x02, 0x00, 0x43, [[0x0a, 0x0b]]],
	[0x00, 0x0b, 0x0f, 0x00],
	[0x30, 0x24, 0x00, 0x44],
	[0x00, 0x44, 0x55, 0x00, [[0x30, 0x44]]],
	[0x30, 0x67, 0x04, 0x00],
	[0xcc, 0x43, 0x10, 0x00],
	[0xcc, 0x33, 0x00, 0x11],
	[0x43, 0x33, 0x8a, 0x00],
	[0x43, 0x33, 0x00, 0x12],
	[0x54, 0x44, 0x00, 0x45],
	[0x54, 0x88, 0x44, 0x00],
	[0x88, 0xef, 0x77, 0x00, [[0xb8, 0xef]]],
	[0x88, 0x88, 0x00, 0x77, [[0x88, 0xb8], [0x88, 0xd4]]],
	[0xcb, 0xb8, 0x00, 0x37]

];

export class GameMap {
	constructor(scene, models, player, maxAnisotropy) {
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
		this.drawRoads(maxAnisotropy, models);

		scene.add(this.land);
	}

	update() {
	}

	drawRoads(maxAnisotropy, models) {
		let roads = [];
		for(let road of ROAD_POSITIONS) {
			if(road.length == 4) {
				roads.push(road);
			} else {
				let x = road[0];
				let y = road[1];
				let w = road[2];
				let h = road[3];
				//console.log("Original=", x, ",", y, "-", w, ",", h);
				let r;
				for(let [bx, by] of road[4]) {
					if(w > 0) {
						this.addStructure(models.models["bridge"], [ bx, by, 0, -0.01, Math.PI/2 ]);
						r = [x, y, bx - x - 1, 0];
						w = w - bx + x - 1;
						x = bx + 1;
					} else {
						this.addStructure(models.models["bridge"], [ bx, by, -0.01, 0, 0 ]);
						r  = [x, y, 0, by - y - 1];
						h = h - by + y - 1;
						y = by + 1;
					}
					roads.push(r);
					//console.log("\tH bridge at=", bx, ",", by, " road=", r);
				}
				if(w > 0) {
					r = [x, y, w - 1, 0];
				} else {
					r  = [x, y, 0, h - 1];
				}
				roads.push(r);
				//console.log("\tfinal road=", r);
			}
		}
		//console.log("roads=", roads);

		// todo: handle overlaps (z-fighting)
		let roadQ = new THREE.Geometry();
		let roadL = new THREE.Geometry();
		for(let road of roads) {
			let geo;
			let lineGeo = new THREE.Geometry();
			if(road[2] > 0) {
				geo = new THREE.PlaneGeometry(road[2] * SECTOR_SIZE, SECTOR_SIZE * .5);
				lineGeo.vertices.push(new THREE.Vector3(0, 0, 0));
				lineGeo.vertices.push(new THREE.Vector3(road[2] * SECTOR_SIZE, 0, 0));
				geo.translate(road[2] * SECTOR_SIZE * .5, 0, 0);
			} else {
				geo = new THREE.PlaneGeometry(SECTOR_SIZE * .5, road[3] * SECTOR_SIZE);
				lineGeo.vertices.push(new THREE.Vector3(0, 0, 0));
				lineGeo.vertices.push(new THREE.Vector3(0, road[3] * SECTOR_SIZE, 0));
				geo.translate(0, road[3] * SECTOR_SIZE * .5, 0);
			}

			for(let i = 0; i < geo.faceVertexUvs[0].length; i++) {
				for(let t = 0; t < geo.faceVertexUvs[0][i].length; t++) {
					let uv = geo.faceVertexUvs[0][i][t];
					if(road[2] > 0) {
						uv.x *= road[2];
					} else {
						uv.y *= road[3];
						// 'rotate' texture so stripes point the correct way
						[uv.y, uv.x] = [uv.x, uv.y];
					}
				}
			}

			let mesh = new THREE.Mesh(geo);
			mesh.position.set(road[0] * SECTOR_SIZE, road[1] * SECTOR_SIZE, 0);
			mesh.updateMatrix();
			roadQ.merge(geo, mesh.matrix);
			mesh.frustumCulled = false;

			let lines = new THREE.LineSegments(lineGeo);
			lines.position.set(road[0] * SECTOR_SIZE, road[1] * SECTOR_SIZE, 0);
			lines.updateMatrix();
			roadL.merge(lineGeo, lines.matrix);
		}

		var canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		var context = canvas.getContext('2d');
		context.fillStyle = "#222222";
		context.fillRect(0, 0, 256, 256);
		context.fillStyle = "#ffcc00";
		context.fillRect(32, 118, 64, 20);
		context.fillRect(160, 118, 64, 20);

		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas);
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		//texture.minFilter = THREE.NearestFilter;
		texture.repeat.set( 1, 1 );
		texture.anisotropy = maxAnisotropy;
		texture.needsUpdate = true;

		let roadMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });
		let roadMesh = new THREE.Mesh(roadQ, roadMat);
		roadMesh.frustumCulled = false;
		this.land.add(roadMesh);

		let roadLineMat = new THREE.LineBasicMaterial({color: 0x222222, linewidth: 1});
		let roadLines = new THREE.LineSegments(roadL, roadLineMat);
		roadLines.position.z = -.5;
		roadLines.frustumCulled = false;
		this.land.add(roadLines);
	}

	addStructure(model, pos) {
		var bb = model.getBoundingBox();
		let sectorX = pos[0];
		let sectorY = pos[1];
		let dx = pos.length > 2 ? pos[2] * SECTOR_SIZE : (SECTOR_SIZE - bb.size().x) / 2;
		let dy = pos.length > 3 ? pos[3] * SECTOR_SIZE : (SECTOR_SIZE - bb.size().y) / 2;
		let zrot = pos.length > 4 ? pos[4] : 0;
		this.addModelAt(sectorX * SECTOR_SIZE + dx, sectorY * SECTOR_SIZE + dy, 0, model, zrot);
	}

	addModelAt(x, y, z, model, zRot) {
		var sx = (x/SECTOR_SIZE)|0;
		var sy = (y/SECTOR_SIZE)|0;
		var ox = x % SECTOR_SIZE;
		var oy = y % SECTOR_SIZE;

		var object = model.createObject();
		this.structures.push(object);

		object.position.set(0, 0, z);
		object.rotation.z = zRot;
		object.position.set(ox, oy, z);

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