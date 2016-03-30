import * as movement from 'movement'
import * as game_map from 'game_map'
import * as util from 'util'
import THREE from 'three.js'
import * as csg from "ThreeCSG"

export const ROOM_SIZE = 50; //game_map.SECTOR_SIZE / 10;
export const DOOR_WIDTH = ROOM_SIZE * .35;
export const DOOR_HEIGHT = ROOM_SIZE * .7;
export const WALL_THICKNESS = 10;
export const DOOR_THICKNESS = WALL_THICKNESS * .25;

export const LIGHT = new THREE.Vector3(0.5, 0.75, 1.0);

export const WALL_SEGMENTS = 3; // making this bigger takes forever to compute
export const CAVE_RAND_FACTOR = 1.25;

export class Door {
	constructor(x, y, dir, roomAName, roomBName, color, key) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.roomAName = roomAName;
		this.roomBName = roomBName;
		this.color = new THREE.Color(color);
		this.key = key;

		this.roomA = null;
		this.roomB = null;

		this.shell_mesh = null;

		this.dx = 0;
		this.dy = 0;
		this.w = WALL_THICKNESS * .5;
		this.h = WALL_THICKNESS * .5;
		switch (dir) {
			case "e":
				this.dx = ROOM_SIZE / 2;
				this.h = DOOR_WIDTH;
				break;
			case "w":
				this.dx = -ROOM_SIZE / 2;
				this.h = DOOR_WIDTH;
				break;
			case "s":
				this.dy = ROOM_SIZE / 2;
				this.w = DOOR_WIDTH;
				break;
			case "n":
				this.dy = -ROOM_SIZE / 2;
				this.w = DOOR_WIDTH;
				break;
		}
	}
}

var roomCount = 0;
export class Room {
	constructor(x, y, w, h, color, cave, teleportToRoom=null) {
		this.name = roomCount;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.color = new THREE.Color(color);
		this.cave = cave;
		this.caveMesh = null;
		this.elevator = roomCount == 0;
		this.teleportToRoom = teleportToRoom;
		roomCount++;
	}
}

export class Level {

	constructor(data, obj) {
		roomCount = 0;
		this.rooms = data.rooms.map((r)=>new Room(r.x, r.y, r.w, r.h, r.color, r.cave));
		for(let teleporter of data.teleporters || []) {
			this.rooms[teleporter.roomA].teleportToRoom = this.rooms[teleporter.roomB];
			this.rooms[teleporter.roomB].teleportToRoom = this.rooms[teleporter.roomA];
		}
		this.doors = data.doors.map((d)=>new Door(d.x, d.y, d.dir, d.roomA, d.roomB, "#cc8800", d.key));
		this.objects = data.objects;

		// where the level is located (world pos)
		this.offsetX = 0;
		this.offsetY = 0;

		// where the lift is located (world pos)
		this.liftX = 0;
		this.liftY = 0;

		let minx = 0, maxx = 0, miny = 0, maxy = 0;
		for(let room of this.rooms) {
			if(room.x < minx) minx = room.x;
			if(room.y < miny) miny = room.y;
			if(room.x + room.w > maxx) maxx = room.x + room.w;
			if(room.y + room.h > maxy) maxy = room.y + room.h;
		}
		this.w = maxx - minx;
		this.h = maxy - miny;
		//console.log("compound: " + minx + "," + miny + "-" + maxx + "," + maxy + " dim=" + this.w + "," + this.h);

		for(let door of this.doors) {
			door.roomA = this.rooms[door.roomAName];
			door.roomB = this.rooms[door.roomBName];
		}

		this.mesh = obj;
	}

	getRoomAtPos(point, externalPoint=false, debug=false) {
		if(externalPoint) {
			point.x -= this.offsetX;
			point.y -= this.offsetY;
		}
		if(debug) console.log("point=", point);
		for(let room of this.rooms) {
			let min = new THREE.Vector3(room.x * ROOM_SIZE, room.y * ROOM_SIZE, movement.ROOM_DEPTH - ROOM_SIZE/2);
			let max = new THREE.Vector3((room.x + room.w) * ROOM_SIZE, (room.y + room.h) * ROOM_SIZE, movement.ROOM_DEPTH + ROOM_SIZE/2);
			if(debug) console.log("...vs " + room.name + " min=",min, " max=", max);
			let box = new THREE.Box3(min, max);
			if(box.containsPoint(point)) {
				if(debug) console.log("!!!");
				return room;
			}
		}
		return null;
	}

	moveToRoom(room, position) {
		position.x = (room.x + room.w/2) * ROOM_SIZE + this.offsetX;
		position.y = (room.y + room.h/2) * ROOM_SIZE + this.offsetY;
	}

	create(scene, x, y, liftX, liftY, models, progressUpdate=null) {
		this.liftX = liftX;
		this.liftY = liftY;
		this.scene = scene;

		this.targetMesh = this.mesh.children[0];
		this.targetMesh["name"] = "room_wall";
		this.targetMesh["type"] = "wall";
		this.mat = this.targetMesh.material;
		this.geo = this.targetMesh.geometry;
		this.geo.translate(this.w/2 * ROOM_SIZE + WALL_THICKNESS, this.h/2 * ROOM_SIZE + WALL_THICKNESS, 0);
		this.caveMeshObj = this.mesh.children[1];
		for(let c of this.caveMeshObj.children) {
			c.geometry.translate(this.w/2 * ROOM_SIZE + WALL_THICKNESS, this.h/2 * ROOM_SIZE + WALL_THICKNESS, 0);
		}

		//let t, t2; t = Date.now();

		// actual doors
		for(let door of this.doors) {

			let dx = (door.x + .5) * ROOM_SIZE + WALL_THICKNESS + door.dx;
			let dy = (door.y + .5) * ROOM_SIZE + WALL_THICKNESS + door.dy;
			let dz = -(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5;

			let door_geo = new THREE.CubeGeometry(door.w * (door.w > door.h ? 1.5 : 1), door.h * (door.h > door.w ? 1.5 : 1), DOOR_HEIGHT);
			let door_mesh = new THREE.Mesh(door_geo,
				new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.FaceColors }));
			util.shadeGeo(door_mesh.geometry, LIGHT, door.color);

			door_mesh.position.set(dx, dy, dz);
			door_mesh["name"] = "door_" + door.dir;
			door_mesh["type"] = "door";
			door_mesh["door"] = door;

			this.targetMesh.add(door_mesh);
		}
		//t2 = Date.now(); console.log("5. " + (t2 - t)); t = t2;

		// objects
		for(let object of this.objects) {
			let m = models.models[object.object];
			let mesh = m.createObject();
			util.shadeGeo(mesh.geometry, LIGHT);
			let dx = (object.x + .5) * ROOM_SIZE;
			let dy = (object.y + .5) * ROOM_SIZE;
			let dz = -(ROOM_SIZE - WALL_THICKNESS) * .5;
			mesh.rotation.z = util.angle2rad(object["rot"] || 0);
			mesh.position.set(dx, dy, dz);
			this.targetMesh.add(mesh);
		}
		//t2 = Date.now(); console.log("6. " + (t2 - t)); t = t2;

		this.makeElevator(x, y);

		// center in start room
		let start = this.rooms[0];
		this.offsetX = x + (- start.x - start.w/2) * ROOM_SIZE;
		this.offsetY = y + (- start.y - start.h/2) * ROOM_SIZE;
		this.mesh.position.set(this.offsetX, this.offsetY, movement.ROOM_DEPTH);
		scene.add( this.mesh );
	}

	makeElevator(x, y) {
		let z = -movement.ROOM_DEPTH - ROOM_SIZE * .5;
		let stripes = 15;
		this.lift_geo = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, z, 1, 1, stripes);
		let dark = new THREE.Color("#cccc88");
		let light = new THREE.Color("#ffffcc");
		let faces = [];
		for (var i = 0; i < this.lift_geo.faces.length; i++) {
			let f = this.lift_geo.faces[i];
			if(f.normal.z == 0) {
				faces.push(f);
				let v = [this.lift_geo.vertices[f.a], this.lift_geo.vertices[f.b], this.lift_geo.vertices[f.c]].
				reduce(function (previous, current) {
					return previous.z < current.z ? previous : current;
				});
				f.color = ((v.z / stripes) | 0) % 2 == 0 ? dark.clone() : light.clone();
			}
		}
		// remove top/bottom face
		this.lift_geo.faces = faces;
		this.lift_mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
		util.shadeGeo(this.lift_geo, LIGHT);
		this.lift_mesh = new THREE.Mesh(this.lift_geo, this.lift_mat);
		this.lift_mesh.position.set(x, y, -z / 2);

		this.scene.add( this.lift_mesh );
	}

	setElevatorLightPercent(percent) {
		if(this.lift_mesh) {
			util.setLightPercent(this.lift_mesh, LIGHT, percent);
		}
	}

	setPosition(x, y) {
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.lift_mesh.position.x = this.liftX;
		this.lift_mesh.position.y = this.liftY;
	}

	destroy() {
		this.scene.remove(this.lift_mesh);
		this.lift_geo.dispose();
		this.lift_mat.dispose();

		this.scene.remove(this.mesh);
		this.geo.dispose();
		this.mat.dispose();

		for(let c of this.caveMeshObj.children) {
			c.geometry.dispose();
		}

	}
}
