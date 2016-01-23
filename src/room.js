import * as movement from 'movement'
import * as game_map from 'game_map'
import * as util from 'util'
import THREE from 'three.js'
import * as csg from "ThreeCSG"

export const ROOM_SIZE = 50; //game_map.SECTOR_SIZE / 10;
const DOOR_WIDTH = ROOM_SIZE * .35;
export const DOOR_HEIGHT = ROOM_SIZE * .7;
const WALL_THICKNESS = 10;
const DOOR_THICKNESS = WALL_THICKNESS * .25;

const LIGHT = new THREE.Vector3(0.5, 0.75, 1.0);

class Door {
	constructor(room, dir, newRoomName) {
		this.room = room;
		this.dir = dir;
		this.newRoomName = newRoomName;
		this.newRoom = null;

		this.dx = 0;
		this.dy = 0;
		this.w = WALL_THICKNESS * .5;
		this.h = WALL_THICKNESS * .5;
		switch (dir) {
			case "e":
				this.dx = this.room.w * ROOM_SIZE / 2;
				this.h = DOOR_WIDTH;
				break;
			case "w":
				this.dx = -(this.room.w * ROOM_SIZE / 2);
				this.h = DOOR_WIDTH;
				break;
			case "s":
				this.dy = this.room.h * ROOM_SIZE / 2;
				this.w = DOOR_WIDTH;
				break;
			case "n":
				this.dy = -(this.room.h * ROOM_SIZE / 2);
				this.w = DOOR_WIDTH;
				break;
		}
	}

	/** find a position that works for both rooms */
	findPos() {
		if(this.dir == "n" || this.dir == "s") {
			let p = util.findAnOverlap(this.room.pos.x, this.room.w, this.newRoom.pos.x, this.newRoom.w);
			this.dx = (p - (this.room.w * .5) - this.room.pos.x) * ROOM_SIZE + (WALL_THICKNESS + ROOM_SIZE) * .5;
		} else if(this.dir == "e" || this.dir == "w") {
			let p = util.findAnOverlap(this.room.pos.y, this.room.h, this.newRoom.pos.y, this.newRoom.h);
			this.dy = (p - (this.room.h * .5) - this.room.pos.y) * ROOM_SIZE + (WALL_THICKNESS + ROOM_SIZE) * .5;
		}
	}

	/**
	 * Generate the same hashcode for both sides of the door.
	 */
	hashCode() {
		let a = this.room.name;
		let b = this.newRoomName;
		let d = this.dir;
		if(d == "s") {
			d = "n";
			[a,b] = [b,a];
		} else if(d == "w") {
			d = "e";
			[a,b] = [b,a];
		}
		return [d,a,b].join(",");
	}
}

export class Room {
	constructor(name, w, h, bg, fg, doors, elevator) {
		this.name = name;
		this.pos = { x: 0, y: 0 };
		this.w = w;
		this.h = h;
		this.bg = new THREE.Color(bg);
		this.fg = new THREE.Color(fg);
		this.doors = {};
		for(let dir in doors) {
			// todo: handle case where door is a list of doors
			this.doors[dir] = new Door(this, dir, doors[dir]);
		}
		this.elevator = elevator;
		this.sector = null;
	}

	positionLift(x, y) {
		this.lift_mesh.position.x = x;
		this.lift_mesh.position.y = y;
	}
}

export class Level {
	constructor(rooms) {
		this.rooms = rooms;
		this.roomPos = {};

		var [minx, miny, maxx, maxy] = this.getDimensions("_start_");
		this.w = maxx - minx;
		this.h = maxy - miny;

		for(let name in this.roomPos) {
			let pos = this.roomPos[name];
			pos.x -= minx;
			pos.y -= miny;
			this.rooms[name].pos = pos;
		}
	}

	getRoom(name) {
		return this.rooms[name];
	}

	getRoomAtPos(point) {
		//console.log("point=", point);
		for(let name in this.rooms) {
			let room = this.rooms[name];
			let min = new THREE.Vector3(room.pos.x * ROOM_SIZE, room.pos.y * ROOM_SIZE, movement.ROOM_DEPTH - ROOM_SIZE/2);
			let max = new THREE.Vector3((room.pos.x + room.w) * ROOM_SIZE, (room.pos.y + room.h) * ROOM_SIZE, movement.ROOM_DEPTH + ROOM_SIZE/2);
			//console.log("...vs " + room.name + " min=",min, " max=", max);
			let box = new THREE.Box3(min, max);
			if(box.containsPoint(point)) {
				//console.log("!!!");
				return room;
			}
		}
		return null;
	}

	getRoomAt(x, y) {
		console.log("pos=", x, ",", y, " offset:", this.offsetX, ",", this.offsetY);
		for(let name in this.rooms) {
			let room = this.rooms[name];

			let px = (room.pos.x + room.w/2) * ROOM_SIZE + WALL_THICKNESS;
			let py = (room.pos.y + room.h/2) * ROOM_SIZE + WALL_THICKNESS;
			console.log("vs room:" + name + " pos=", room.pos, " dim=", room.w, ",", room.h + " pp=" + px + "," + py + "-" + (px + room.w * ROOM_SIZE) + "," + (py + room.h * ROOM_SIZE));

			if(x >= px && x < px + room.w * ROOM_SIZE &&
				y >= py && y < py + room.h * ROOM_SIZE) {
				return room;
			}
		}
		return null;
	}

	getDimensions(name, x, y, minx, miny, maxx, maxy, seenRooms) {
		if(!x) x = 0;
		if(!y) y = 0;
		if(!minx) minx = 0;
		if(!miny) miny = 0;
		if(!maxx) maxx = 0;
		if(!maxy) maxy = 0;
		let room = this.rooms[name];
		this.roomPos[name] ={x:x, y:y};

		// connect doors
		for(let dir in room.doors) {
			let door = room.doors[dir];
			door.newRoom = this.rooms[door.newRoomName];
			let oppositeDir = util.getOppositeDir(door.dir);
			console.log("dir=" + dir + " room=" + room.name + " other=" + door.newRoomName + ",", door.newRoom);
			if(door.newRoom.doors[oppositeDir] == null) {
				door.newRoom.doors[oppositeDir] = new Door(door.newRoom, oppositeDir, room.name);
			}
		}

		if(x < minx) minx = x;
		if(x + room.w > maxx) maxx = x + room.w;
		if(y < miny) miny = y;
		if(y + room.h > maxy) maxy = y + room.h;

		if(!seenRooms) seenRooms = {};
		for(let dir in room.doors) {
			let _name = room.doors[dir].newRoomName;
			if(seenRooms[_name] == null) {
				seenRooms[_name] = true;
				let _room = this.rooms[_name];
				let nx = x;
				let ny = y;
				switch (dir) {
					case "n": ny = y - _room.h; break;
					case "s": ny = y + room.h; break;
					case "w": nx = x - _room.w; break;
					case "e": nx = x + room.w; break;
				}
				[minx, miny, maxx, maxy] = this.getDimensions(_name, nx, ny, minx, miny, maxx, maxy, seenRooms);
			}
		}
		return [minx, miny, maxx, maxy];
	}

	create(sector, x, y) {
		console.log("Level block " + this.w + "," + this.h);
		var level_geometry = new THREE.CubeGeometry( this.w * ROOM_SIZE + WALL_THICKNESS * 2, this.h * ROOM_SIZE + WALL_THICKNESS * 2, ROOM_SIZE );
		level_geometry.computeVertexNormals();
		util.shadeGeo(level_geometry, LIGHT, new THREE.Color("#ffffcc"));
		var level_mesh = new THREE.Mesh( level_geometry );
		level_mesh.position.set((this.w * ROOM_SIZE)/2 + WALL_THICKNESS, (this.h * ROOM_SIZE)/2 + WALL_THICKNESS, 0);
		var level_bsp = new csg.ThreeBSP( level_mesh );

		// cut out the rooms
		for(let name in this.roomPos) {
			let room = this.rooms[name];
			let pos = this.roomPos[name];
			let rx = (pos.x + room.w/2) * ROOM_SIZE + WALL_THICKNESS;
			let ry = (pos.y + room.h/2) * ROOM_SIZE + WALL_THICKNESS;
			console.log("rendering room: " + name + " at " + pos.x + "," + pos.y + " size=" + room.w + "," + room.h + " pos=" + rx + "," + ry);

			let inner_geometry = new THREE.CubeGeometry( room.w * ROOM_SIZE - WALL_THICKNESS, room.h * ROOM_SIZE - WALL_THICKNESS, ROOM_SIZE - WALL_THICKNESS );
			inner_geometry.computeVertexNormals();
			util.shadeGeo(inner_geometry, LIGHT, room.bg);
			let inner_mesh = new THREE.Mesh( inner_geometry );
			inner_mesh.position.set(rx, ry, 0);
			let inner_bsp = new csg.ThreeBSP( inner_mesh );

			level_bsp = level_bsp.subtract( inner_bsp );
		}

		// door cutouts
		let seenDoors = {};
		for(let name in this.rooms) {
			let room = this.rooms[name];
			for(let dir in room.doors) {
				let door = room.doors[dir];
				if(seenDoors[door.hashCode()] == null) {
					console.log("Drawing door: " + door.hashCode());

					let rx = (room.pos.x + room.w/2) * ROOM_SIZE + WALL_THICKNESS;
					let ry = (room.pos.y + room.h/2) * ROOM_SIZE + WALL_THICKNESS;

					// find a common block between rooms
					door.findPos();

					let dx = rx + door.dx;
					let dy = ry + door.dy;
					let dz = -(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5;

					let shell_geo = new THREE.CubeGeometry(DOOR_WIDTH, DOOR_WIDTH, DOOR_HEIGHT);
					let shell_mesh = new THREE.Mesh(shell_geo);
					shell_mesh.position.set(dx, dy, dz);
					let shell_bsp = new csg.ThreeBSP(shell_mesh);
					level_bsp = level_bsp.subtract(shell_bsp);

					seenDoors[door.hashCode()] = { x: dx, y: dy, z: dz, door: door }
				}
			}
		}

		// todo: 'add' elevator parts (alternating color blocks)

		this.mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
		this.mesh = level_bsp.toMesh( this.mat );
		this.mesh["name"] = "room_wall";
		this.mesh["type"] = "wall";
		this.geo = this.mesh.geometry;
		this.geo.computeVertexNormals();

		// color rooms' walls separately

		// actual doors
		for(let h in seenDoors) {
			let v = seenDoors[h];
			let door = v.door;
			let door_geo = new THREE.CubeGeometry(door.w, door.h, DOOR_HEIGHT);
			util.shadeGeo(door_geo, LIGHT, door.room.fg);
			let door_mesh = new THREE.Mesh(door_geo,
				new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.FaceColors }));
			door_mesh.position.set(v.x - this.w * ROOM_SIZE * .5 - WALL_THICKNESS, v.y - this.h * ROOM_SIZE * .5 - WALL_THICKNESS, v.z);
			door_mesh["name"] = "door_" + door.dir;
			door_mesh["type"] = "door";
			door_mesh["dir"] = door.dir;

			this.mesh.add(door_mesh);
		}

		this.sector = sector;
		this.makeElevator(x, y);
		this.offsetX = x;
		this.offsetY = y;

		this.mesh.position.set(x, y, movement.ROOM_DEPTH);

		// color the rooms
		for(let face of this.geo.faces) {
			let p = this.geo.vertices[face.a].clone();
			p.x += this.w * ROOM_SIZE * .5;
			p.y += this.h * ROOM_SIZE * .5;
			p.z += movement.ROOM_DEPTH;
			let room = this.getRoomAtPos(p);
			if (room) {
				face.color = room.bg.clone();
			}
		}
		util.shadeGeo(this.geo, LIGHT);

		sector.add( this.mesh );
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

		this.sector.add( this.lift_mesh );
	}

	positionLift(x, y) {
		this.lift_mesh.position.x = x;
		this.lift_mesh.position.y = y;
	}

	destroy() {
		this.sector.remove(this.lift_mesh);
		this.lift_geo.dispose();
		this.lift_mat.dispose();

		this.sector.remove(this.mesh);
		this.geo.dispose();
		this.mat.dispose();

	}
}
