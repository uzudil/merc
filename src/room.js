import * as movement from 'movement'
import * as game_map from 'game_map'
import * as util from 'util'
import THREE from 'three.js'
import * as csg from "ThreeCSG"
import * as constants from "constants"

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
		this.w = constants.WALL_THICKNESS * .5;
		this.h = constants.WALL_THICKNESS * .5;
		switch (dir) {
			case "e":
				this.dx = constants.ROOM_SIZE / 2;
				this.h = constants.DOOR_WIDTH;
				break;
			case "w":
				this.dx = -constants.ROOM_SIZE / 2;
				this.h = constants.DOOR_WIDTH;
				break;
			case "s":
				this.dy = constants.ROOM_SIZE / 2;
				this.w = constants.DOOR_WIDTH;
				break;
			case "n":
				this.dy = -constants.ROOM_SIZE / 2;
				this.w = constants.DOOR_WIDTH;
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
		this.minPoint = new THREE.Vector2();
		this.maxPoint = new THREE.Vector2();
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
		this.initialized = false;
	}

	getRoomAtPos(point, externalPoint=false, debug=false) {
		if(externalPoint) {
			point.x -= this.offsetX;
			point.y -= this.offsetY;
		}
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

	moveToRoom(room, position) {
		position.x = (room.x + room.w/2) * constants.ROOM_SIZE + this.offsetX;
		position.y = (room.y + room.h/2) * constants.ROOM_SIZE + this.offsetY;
	}

	create(scene, x, y, liftX, liftY, models, visible=false) {
		this.liftX = liftX;
		this.liftY = liftY;
		this.scene = scene;

		this.targetMesh = this.mesh.children[0];
		this.geo = this.targetMesh.geometry;

		if (constants.CAVES_ENABLED) {
			this.caveMeshObj = this.mesh.children[1];
		}

		if(!this.initialized) {
			this.initialized = true;
			// actual doors
			for(let door of this.doors) {

				let dx = (door.x + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS + door.dx;
				let dy = (door.y + .5) * constants.ROOM_SIZE + constants.WALL_THICKNESS + door.dy;
				let dz = -(constants.ROOM_SIZE - constants.DOOR_HEIGHT - constants.WALL_THICKNESS) * .5;

				let door_geo = door.w > door.h ? constants.DOOR_NS : constants.DOOR_EW;
				let door_mesh = new THREE.Mesh(door_geo, constants.DOOR_MATERIAL);

				door_mesh.position.set(dx, dy, dz);
				door_mesh["name"] = "door_" + door.dir;
				door_mesh["type"] = "door";
				door_mesh["door"] = door;

				this.targetMesh.add(door_mesh);
			}

			// objects
			for(let object of this.objects) {
				let m = models.models[object.object];
				let mesh = m.createObject();
				let dx = (object.x + .5) * constants.ROOM_SIZE;
				let dy = (object.y + .5) * constants.ROOM_SIZE;
				let dz = -(constants.ROOM_SIZE - constants.WALL_THICKNESS) * .5;
				mesh.rotation.z = util.angle2rad(object["rot"] || 0);
				mesh.position.set(dx, dy, dz);
				this.targetMesh.add(mesh);
			}

		}

		this.makeElevator(x, y);

		// center in start room
		let start = this.rooms[0];
		this.offsetX = x + (- start.x - start.w/2) * constants.ROOM_SIZE;
		this.offsetY = y + (- start.y - start.h/2) * constants.ROOM_SIZE;
		this.mesh.position.set(this.offsetX, this.offsetY, movement.ROOM_DEPTH);
		this.mesh.visible = visible;
		scene.add( this.mesh );
	}

	makeElevator(x, y) {
		let z = -movement.ROOM_DEPTH - (constants.ROOM_SIZE - constants.WALL_THICKNESS) * .5;
		let stripes = 15;
		this.lift_geo = new THREE.BoxGeometry(constants.ROOM_SIZE, constants.ROOM_SIZE, z, 1, 1, stripes);
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
		util.compressGeo(this.lift_geo);
		this.lift_mesh = new THREE.Mesh(this.lift_geo, constants.MATERIAL);
		this.lift_mesh.position.set(x, y, -z / 2);

		this.scene.add( this.lift_mesh );
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

		this.scene.remove(this.mesh);
		this.geo.dispose();

		if (constants.CAVES_ENABLED) {
			for (let c of this.caveMeshObj.children) {
				c.geometry.dispose();
			}
		}
	}
}
