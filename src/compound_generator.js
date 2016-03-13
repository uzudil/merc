import * as movement from 'movement'
import * as game_map from 'game_map'
import * as util from 'util'
import THREE from 'three.js'
import * as csg from "ThreeCSG"
import * as constants from "room"

export class CompoundGenerator {
	constructor(rooms, doors, objects, models, w, h) {
		this.rooms = rooms;
		this.doors = doors;
		this.objects = objects;
		this.models = models;
		this.w = w;
		this.h = h;
	}

	generate() {
		let t, t2;
		t = Date.now();

		var level_geometry = new THREE.CubeGeometry(
			this.w * constants.ROOM_SIZE + constants.WALL_THICKNESS * 2,
			this.h * constants.ROOM_SIZE + constants.WALL_THICKNESS * 2,
			constants.ROOM_SIZE );
		level_geometry.computeVertexNormals();
		util.shadeGeo(level_geometry, constants.LIGHT, new THREE.Color("#ffffcc"));
		var level_mesh = new THREE.Mesh( level_geometry );
		level_mesh.position.set(
			(this.w * constants.ROOM_SIZE)/2 + constants.WALL_THICKNESS,
			(this.h * constants.ROOM_SIZE)/2 + constants.WALL_THICKNESS,
			0);
		var level_bsp = new csg.ThreeBSP( level_mesh );

		t2 = Date.now(); console.log("1. " + (t2 - t)); t = t2;

		// cut out the rooms
		for(let room of this.rooms) {
			let inner_geometry = new THREE.CubeGeometry(
				room.w * constants.ROOM_SIZE - constants.WALL_THICKNESS,
				room.h * constants.ROOM_SIZE - constants.WALL_THICKNESS,
				constants.ROOM_SIZE - constants.WALL_THICKNESS);
			let inner_mesh = new THREE.Mesh(inner_geometry);

			let rx = (room.x + room.w/2) * constants.ROOM_SIZE + constants.WALL_THICKNESS;
			let ry = (room.y + room.h/2) * constants.ROOM_SIZE + constants.WALL_THICKNESS;
			inner_mesh.position.set(rx, ry, 0);

			let inner_bsp = new csg.ThreeBSP( inner_mesh );

			level_bsp = level_bsp.subtract( inner_bsp );
		}
		t2 = Date.now(); console.log("2. " + (t2 - t)); t = t2;

		// door cutouts
		for(let door of this.doors) {
			//console.log("Drawing door: " + door.x + "," + door.y + " dir=" + door.dir + " dx/dy=" + door.dx + "," + door.dy);

			let dx = (door.x + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS + door.dx;
			let dy = (door.y + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS + door.dy;
			let dz = -(constants.ROOM_SIZE - constants.DOOR_HEIGHT - constants.WALL_THICKNESS) * .5;

			let shell_mesh;
			if(door.key == "") {
				let shell_geo = new THREE.CubeGeometry(constants.DOOR_WIDTH, constants.DOOR_WIDTH, constants.DOOR_HEIGHT);
				shell_mesh = new THREE.Mesh(shell_geo);
			} else {
				let keyModel = models.models[door.key];
				shell_mesh = keyModel.createObject();
				shell_mesh.geometry = shell_mesh.geometry.clone();

				// sizing and position by trial-and-error...
				let w, h;
				if(door.dir == "n" || door.dir == "s") {
					shell_mesh.geometry.rotateZ(Math.PI/2);
					w = (keyModel.bbox.size().x / door.h) * 1.25;
					h = (keyModel.bbox.size().y / door.w) * 2;
				} else {
					w = (keyModel.bbox.size().x / door.w) * 2;
					h = (keyModel.bbox.size().y / door.h);
				}

				let modelZ = keyModel.bbox.size().z;
				let zz = (modelZ / constants.DOOR_HEIGHT) * 1.3;

				shell_mesh.geometry.scale(w, h, zz);
				dz = -(constants.ROOM_SIZE - constants.DOOR_HEIGHT) - constants.WALL_THICKNESS * .55;
			}

			shell_mesh.position.set(dx, dy, dz);
			door.shell_mesh = shell_mesh.clone();

			let shell_bsp = new csg.ThreeBSP(shell_mesh);
			level_bsp = level_bsp.subtract(shell_bsp);
		}
		t2 = Date.now(); console.log("3. " + (t2 - t)); t = t2;

		this.mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
		// this is the mesh targeted by the raycasters
		this.targetMesh = level_bsp.toMesh( this.mat );
		this.targetMesh["merc_name"] = "room_wall";
		this.targetMesh["merc_type"] = "wall";
		this.geo = this.targetMesh.geometry;
		this.geo.computeVertexNormals();

		// the uber-mesh that contains everything
		this.mesh = new THREE.Object3D();
		this.mesh.add(this.targetMesh);

		// add the cave meshes
		this.caveMeshObj = new THREE.Object3D();
		//this.caveMeshObj.position.set(
		//			(this.w * constants.ROOM_SIZE)/2 + constants.WALL_THICKNESS,
		//			(this.h * constants.ROOM_SIZE)/2 + constants.WALL_THICKNESS,
		//			0);
		this.mesh.add(this.caveMeshObj);

		this.caveMeshes = [];

		//// actual doors
		//for(let door of this.doors) {
		//	let dx = (door.x + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS + door.dx - this.w * constants.ROOM_SIZE * .5 - constants.WALL_THICKNESS;
		//	let dy = (door.y + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS + door.dy - this.h * constants.ROOM_SIZE * .5 - constants.WALL_THICKNESS;
		//	let dz = -(constants.ROOM_SIZE - constants.DOOR_HEIGHT - constants.WALL_THICKNESS) * .5;
		//
		//	let door_geo = new THREE.CubeGeometry(door.w * (door.w > door.h ? 1.5 : 1), door.h * (door.h > door.w ? 1.5 : 1), constants.DOOR_HEIGHT);
		//	let door_mesh = new THREE.Mesh(door_geo,
		//		new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.FaceColors }));
		//	util.shadeGeo(door_mesh.geometry, constants.LIGHT, door.color);
		//
		//	door_mesh.position.set(dx, dy, dz);
		//	door_mesh["merc_name"] = "door_" + door.dir;
		//	door_mesh["merc_type"] = "door";
		//	door_mesh["door"] = door;
		//
		//	this.targetMesh.add(door_mesh);
		//}
		//t2 = Date.now(); console.log("5. " + (t2 - t)); t = t2;
		//
		//// objects
		//for(let object of this.objects) {
		//	let m = models.models[object.object];
		//	let mesh = m.createObject();
		//	let dx = (object.x + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS - this.w * constants.ROOM_SIZE * .5 - constants.WALL_THICKNESS;
		//	let dy = (object.y + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS - this.h * constants.ROOM_SIZE * .5 - constants.WALL_THICKNESS;
		//	let dz = -(constants.ROOM_SIZE - constants.WALL_THICKNESS) * .5;
		//	mesh.rotation.z = util.angle2rad(object["rot"] || 0);
		//	mesh.position.set(dx, dy, dz);
		//	this.targetMesh.add(mesh);
		//}
		//t2 = Date.now(); console.log("6. " + (t2 - t)); t = t2;

		// color the rooms
		for(let face of this.geo.faces) {
			let p = this.geo.vertices[face.a].clone();
			p.x += this.w * constants.ROOM_SIZE * .5;
			p.y += this.h * constants.ROOM_SIZE * .5;
			p.z += movement.ROOM_DEPTH;
			let room = this.getRoomAtPos(p);
			if (room) {
				face.color = room.color.clone();
			}
		}
		util.shadeGeo(this.geo, constants.LIGHT);
		t2 = Date.now(); console.log("8. " + (t2 - t)); t = t2;

		for(let room of this.rooms) {
			this.makeCaveRoom(room);
		}
	}

	getRoomAtPos(point, debug=false) {
		if(debug) console.log("point=", point);
		for(let room of this.rooms) {
			let min = new THREE.Vector3(room.x * constants.ROOM_SIZE, room.y * constants.ROOM_SIZE, movement.ROOM_DEPTH - constants.ROOM_SIZE/2);
			let max = new THREE.Vector3((room.x + room.w) * constants.ROOM_SIZE, (room.y + room.h) * constants.ROOM_SIZE, movement.ROOM_DEPTH + constants.ROOM_SIZE/2);
			if(debug) console.log("...vs " + room.name + " min=",min, " max=", max);
			let box = new THREE.Box3(min, max);
			if(box.containsPoint(point)) {
				if(debug) console.log("!!!");
				return room;
			}
		}
		return null;
	}

	makeCaveRoom(room) {
		if(!room.cave || room.caveMesh) {
			return;
		}

		let rx = (room.x + room.w/2) * constants.ROOM_SIZE + constants.WALL_THICKNESS;
		let ry = (room.y + room.h/2) * constants.ROOM_SIZE + constants.WALL_THICKNESS;
		let w = room.w * constants.ROOM_SIZE - constants.WALL_THICKNESS - constants.CAVE_RAND_FACTOR * 2;
		let h = room.h * constants.ROOM_SIZE - constants.WALL_THICKNESS - constants.CAVE_RAND_FACTOR * 2;
		let d = constants.ROOM_SIZE - constants.WALL_THICKNESS;
		let geo = new THREE.BoxGeometry(
			w, h, d,
			room.w * constants.WALL_SEGMENTS,
			room.h * constants.WALL_SEGMENTS,
			constants.WALL_SEGMENTS
		);
		for (let v of geo.vertices) {
			v.x += Math.random() * constants.CAVE_RAND_FACTOR * 2 - constants.CAVE_RAND_FACTOR;
			v.y += Math.random() * constants.CAVE_RAND_FACTOR * 2 - constants.CAVE_RAND_FACTOR;
			v.z += Math.random() * constants.CAVE_RAND_FACTOR * 2 - constants.CAVE_RAND_FACTOR;
		}
		let mesh = new THREE.Mesh(geo);
		mesh.position.set(rx, ry, 0);
		let bsp = new csg.ThreeBSP(mesh);

		geo = new THREE.BoxGeometry(w + constants.CAVE_RAND_FACTOR * 3, h + constants.CAVE_RAND_FACTOR * 3, d);
		mesh = new THREE.Mesh(geo);
		mesh.position.set(rx, ry, constants.CAVE_RAND_FACTOR / 2);
		bsp = new csg.ThreeBSP(mesh).subtract(bsp);

		mesh = bsp.toMesh(this.mat);
		room.caveMesh = mesh;

		// cutout doors
		for(let door of this.doors) {
			if(door.roomA == room) this.cutoutCaveDoor(door, door.roomA);
			if(door.roomB == room) this.cutoutCaveDoor(door, door.roomB);
		}

		let dx = (room.x + room.w/2 - this.w/2) * constants.ROOM_SIZE;
		let dy = (room.y + room.h/2 - this.h/2) * constants.ROOM_SIZE;
		let dz = 0;
		room.caveMesh.position.set(dx, dy, dz);
		room.caveMesh.updateMatrix();

		for(let face of room.caveMesh.geometry.faces) {
			face.color = room.color.clone();
		}
		room.caveMesh.geometry.computeVertexNormals();
		room.caveMesh.geometry.computeFaceNormals();
		util.shadeGeo(room.caveMesh.geometry, constants.LIGHT);
		this.caveMeshObj.add(room.caveMesh);
		this.caveMeshes.push(room.caveMesh);
	}

	cutoutCaveDoor(door, room) {
		let t = Date.now();
		let shell_bsp = new csg.ThreeBSP(door.shell_mesh);
		let bsp = new csg.ThreeBSP(room.caveMesh);
		bsp = bsp.subtract(shell_bsp);
		room.caveMesh = bsp.toMesh(this.mat);
		for (let face of room.caveMesh.geometry.faces) {
			face.color = room.color.clone();
		}
		console.log("cutoutCaveDoor time=" + (Date.now() - t) + " room=" + room.name + " door=" + door.x + "," + door.y);
	}
}