import THREE from 'three.js'
import * as util from 'util'
import * as world from 'world'
import * as constants from 'constants'
import * as model_package from 'model'

var key = (sectorX, sectorY) => `${sectorX}.${sectorY}`;

export class GameMap {
	constructor(scene, models, maxAnisotropy) {
		this.scene = scene;
		this.models = models;
		this.maxAnisotropy = maxAnisotropy;
		this.land = new THREE.Object3D();
		this.sectors = {};
		this.minSector = {x: 0, y: 0};
		this.maxSector = {x: 0, y: 0};

		// limit calcs
		this.heading = new THREE.Vector3();
		this.point = new THREE.Vector3();

		// add models
		this.structures = [];
		this.vehicles = [];
		this.xenoBase = null;
	}

	initModels() {
		for (let name in this.models.models) {
			var m = this.models.models[name];
			if (world.WORLD.structures[name] && world.WORLD.structures[name].length > 0) {
				for (let pos of world.WORLD.structures[name]) {
					pos[4] = util.angle2rad(pos[4]);
					this.addStructure(m, pos);
				}
			}
		}
	}

	compressSectors() {
		for (let key in this.sectors) {
			let sector = this.sectors[key];
			let meshes = sector.children.filter((child) => child.model.canCompress);
			if (meshes.length > 0) {
				sector.updateMatrix();
				let geo = new THREE.Geometry();
				for (let child of meshes) {
					child.updateMatrix();
					geo.merge(child.geometry, child.matrix);
					child.parent.remove(child);
				}
				util.compressGeo(geo);
				let mesh = new THREE.Mesh(geo, constants.MATERIAL);
				sector.add(mesh);
			}
		}
	}

	addXenoBase() {
		this.xenoBase = this.addStructure(this.models.models["xeno"], [0xf8, 0xc9], 10000);
		this.xenoBase.visible = false;
	}

	addRoads() {
		this.drawRoads(this.maxAnisotropy, this.models);
	}

	finishInit() {
		this.scene.add(this.land);
	}

	drawRoads(maxAnisotropy, models) {
		let roads = [];
		for(let road of world.WORLD.roads) {
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
						this.addStructure(models.models["bridge"], [ bx, by, 0.001, -0.01, Math.PI/2 ]);
						r = [x, y, bx - x - 1, 0];
						w = w - bx + x - 1;
						x = bx + 1;
					} else {
						this.addStructure(models.models["bridge"], [ bx, by, -0.01, 0.001, 0 ]);
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
			lineGeo.vertices.push(new THREE.Vector3(0, 0, 0));
			if(road[2] > 0) {
				geo = new THREE.PlaneGeometry(road[2] * constants.SECTOR_SIZE, constants.SECTOR_SIZE * .5);
				lineGeo.vertices.push(new THREE.Vector3(road[2] * constants.SECTOR_SIZE, 0, 0));
				geo.translate(road[2] * constants.SECTOR_SIZE * .5, 0, 0);
			} else {
				geo = new THREE.PlaneGeometry(constants.SECTOR_SIZE * .5, road[3] * constants.SECTOR_SIZE);
				lineGeo.vertices.push(new THREE.Vector3(0, road[3] * constants.SECTOR_SIZE, 0));
				geo.translate(0, road[3] * constants.SECTOR_SIZE * .5, 0);
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
			mesh.position.set(road[0] * constants.SECTOR_SIZE, road[1] * constants.SECTOR_SIZE, 0);
			mesh.updateMatrix();
			roadQ.merge(geo, mesh.matrix);
			mesh.frustumCulled = false;

			let lines = new THREE.LineSegments(lineGeo);
			lines.position.set(road[0] * constants.SECTOR_SIZE, road[1] * constants.SECTOR_SIZE, 0);
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

	addStructure(model, pos, zpos) {
		var bb = model.getBoundingBox();
		let sectorX = pos[0];
		let sectorY = pos[1];
		let dx = pos.length > 2 && pos[2] != 0 ? pos[2] * constants.SECTOR_SIZE : (constants.SECTOR_SIZE - bb.size().x) / 2;
		let dy = pos.length > 3 && pos[3] != 0 ? pos[3] * constants.SECTOR_SIZE : (constants.SECTOR_SIZE - bb.size().y) / 2;
		let dz = zpos || 0;
		let zrot = pos.length > 4 ? pos[4] : 0;
		return this.addModelAt(sectorX * constants.SECTOR_SIZE + dx, sectorY * constants.SECTOR_SIZE + dy, dz, model, zrot);
	}

	addModelAt(x, y, z, model, zRot) {
		var object = model.createObject();
		if(model.hasBB()) this.structures.push(object);
		if(model instanceof model_package.Vehicle) {
			object["vehicleIndex"] = this.vehicles.length;
			this.vehicles.push(object);
		}
		return this.addObjectAt(x, y, z, object, zRot);
	}

	addObjectAt(x, y, z, object, zRot) {
		var sx = (x/constants.SECTOR_SIZE)|0;
		var sy = (y/constants.SECTOR_SIZE)|0;
		var ox = x % constants.SECTOR_SIZE;
		var oy = y % constants.SECTOR_SIZE;

		object.position.set(0, 0, z);
		object.rotation.z = zRot;
		object.position.set(ox, oy, z);

		this.getSector(sx, sy).add(object);

		return object;
	}

	getSector(sectorX, sectorY) {
		var k = key(sectorX, sectorY);
		if(this.sectors[k] == null) {
			let o = new THREE.Object3D();
			o["road"] = [0, 0];
			o["sectorX"] = sectorX;
			o["sectorY"] = sectorY;
			o.position.set(sectorX * constants.SECTOR_SIZE, sectorY * constants.SECTOR_SIZE, 0);
			this.sectors[k] = o;
			this.land.add(o);
			if(sectorX <= this.minSector.x) this.minSector.x = sectorX;
			if(sectorY <= this.minSector.y) this.minSector.y = sectorY;
			if(sectorX >= this.maxSector.x) this.maxSector.x = sectorX;
			if(sectorY >= this.maxSector.y) this.maxSector.y = sectorY;
		}
		return this.sectors[k];
	}

	addShip(x, y, zrot) {
		this.addModelAt(
			x + 100,
			y + 100,
			0,
			this.models.models["ship"],
			zrot);
	}
}