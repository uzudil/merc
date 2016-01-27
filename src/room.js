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

export class Door {
	constructor(x, y, dir, roomAName, roomBName, color) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.roomAName = roomAName;
		this.roomBName = roomBName;
		this.color = new THREE.Color(color);

		this.roomA = null;
		this.roomB = null;

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
	constructor(x, y, w, h, color) {
		this.name = roomCount;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.color = new THREE.Color(color);
		this.elevator = roomCount == 0;
		roomCount++;
	}
}

export class Level {

	constructor(data) {
		roomCount = 0;
		this.rooms = data.rooms.map((r)=>new Room(r.x, r.y, r.w, r.h, r.color, true));
		this.doors = data.doors.map((d)=>new Door(d.x, d.y, d.dir, d.roomA, d.roomB, "#cc8800"));

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
		console.log("compound: " + minx + "," + miny + "-" + maxx + "," + maxy + " dim=" + this.w + "," + this.h);

		for(let door of this.doors) {
			door.roomA = this.rooms[door.roomAName];
			door.roomB = this.rooms[door.roomBName];
		}
	}

	getRoomAtPos(point, externalPoint=false, debug=false) {
		if(externalPoint) {
			point.x -= this.offsetX - this.w * ROOM_SIZE/2;
			point.y -= this.offsetY - this.h * ROOM_SIZE/2;
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

	create(scene, x, y, liftX, liftY) {
		this.liftX = liftX;
		this.liftY = liftY;

		var level_geometry = new THREE.CubeGeometry( this.w * ROOM_SIZE + WALL_THICKNESS * 2, this.h * ROOM_SIZE + WALL_THICKNESS * 2, ROOM_SIZE );
		level_geometry.computeVertexNormals();
		util.shadeGeo(level_geometry, LIGHT, new THREE.Color("#ffffcc"));
		var level_mesh = new THREE.Mesh( level_geometry );
		level_mesh.position.set((this.w * ROOM_SIZE)/2 + WALL_THICKNESS, (this.h * ROOM_SIZE)/2 + WALL_THICKNESS, 0);
		var level_bsp = new csg.ThreeBSP( level_mesh );

		// cut out the rooms
		for(let room of this.rooms) {
			let rx = (room.x + room.w/2) * ROOM_SIZE + WALL_THICKNESS;
			let ry = (room.y + room.h/2) * ROOM_SIZE + WALL_THICKNESS;
			console.log("rendering room: " + name + " at " + room.x + "," + room.y + " size=" + room.w + "," + room.h + " pos=" + rx + "," + ry);

			let inner_geometry = new THREE.CubeGeometry( room.w * ROOM_SIZE - WALL_THICKNESS, room.h * ROOM_SIZE - WALL_THICKNESS, ROOM_SIZE - WALL_THICKNESS );
			let inner_mesh = new THREE.Mesh( inner_geometry );
			inner_mesh.position.set(rx, ry, 0);
			let inner_bsp = new csg.ThreeBSP( inner_mesh );

			level_bsp = level_bsp.subtract( inner_bsp );
		}

		// door cutouts
		for(let door of this.doors) {
			console.log("Drawing door: " + door.x + "," + door.y + " dir=" + door.dir + " dx/dy=" + door.dx + "," + door.dy);

			let dx = (door.x + .5) * ROOM_SIZE + WALL_THICKNESS + door.dx;
			let dy = (door.y + .5) * ROOM_SIZE + WALL_THICKNESS + door.dy;
			let dz = -(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5;

			let shell_geo = new THREE.CubeGeometry(DOOR_WIDTH, DOOR_WIDTH, DOOR_HEIGHT);
			let shell_mesh = new THREE.Mesh(shell_geo);
			shell_mesh.position.set(dx, dy, dz);
			let shell_bsp = new csg.ThreeBSP(shell_mesh);
			level_bsp = level_bsp.subtract(shell_bsp);
		}

		this.mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
		this.mesh = level_bsp.toMesh( this.mat );
		this.mesh["name"] = "room_wall";
		this.mesh["type"] = "wall";
		this.geo = this.mesh.geometry;
		this.geo.computeVertexNormals();

		// actual doors
		for(let door of this.doors) {

			let dx = (door.x + .5) * ROOM_SIZE + WALL_THICKNESS + door.dx - this.w * ROOM_SIZE * .5 - WALL_THICKNESS;
			let dy = (door.y + .5) * ROOM_SIZE + WALL_THICKNESS + door.dy - this.h * ROOM_SIZE * .5 - WALL_THICKNESS;
			let dz = -(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5;

			let door_geo = new THREE.CubeGeometry(door.w, door.h, DOOR_HEIGHT);
			util.shadeGeo(door_geo, LIGHT, door.color);
			let door_mesh = new THREE.Mesh(door_geo,
				new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.FaceColors }));
			//door_mesh.position.set(
			//	door.x + door.dx - this.w * ROOM_SIZE * .5 - WALL_THICKNESS,
			//	door.y + door.dy - this.h * ROOM_SIZE * .5 - WALL_THICKNESS,
			//	-(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5);
			door_mesh.position.set(dx, dy, dz);
			door_mesh["name"] = "door_" + door.dir;
			door_mesh["type"] = "door";
			door_mesh["dir"] = door.dir;

			this.mesh.add(door_mesh);
		}

		this.scene = scene;
		this.makeElevator(x, y);

		// center in start room
		let start = this.rooms[0];
		this.offsetX = x + (this.w/2 - start.x - start.w/2) * ROOM_SIZE;
		this.offsetY = y + (this.h/2 - start.y - start.h/2) * ROOM_SIZE;
		this.mesh.position.set(this.offsetX, this.offsetY, movement.ROOM_DEPTH);

		// color the rooms
		for(let face of this.geo.faces) {
			let p = this.geo.vertices[face.a].clone();
			p.x += this.w * ROOM_SIZE * .5;
			p.y += this.h * ROOM_SIZE * .5;
			p.z += movement.ROOM_DEPTH;
			let room = this.getRoomAtPos(p);
			if (room) {
				face.color = room.color.clone();
			}
		}
		util.shadeGeo(this.geo, LIGHT);

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

	}
}
