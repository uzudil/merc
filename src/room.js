import * as movement from 'movement'
import * as game_map from 'game_map'
import * as util from 'util'
import THREE from 'three.js'
import * as csg from "ThreeCSG"

export const ROOM_SIZE = 50; //game_map.SECTOR_SIZE / 10;
const DOOR_WIDTH = ROOM_SIZE * .35;
const DOOR_HEIGHT = ROOM_SIZE * .7;
const WALL_THICKNESS = 10;
const DOOR_THICKNESS = WALL_THICKNESS * .25;

const LIGHT = new THREE.Vector3(0.5, 0.75, 1.0);

class Door {
	constructor(room, dir) {
		this.room = room;
		this.dir = dir;

		this.dx = 0;
		this.dy = 0;
		this.w = DOOR_THICKNESS;
		this.h = DOOR_THICKNESS;
		switch (dir) {
			case "e":
				this.dx = this.room.w * ROOM_SIZE / 2 - DOOR_THICKNESS;
				this.h = DOOR_WIDTH;
				break;
			case "w":
				this.dx = -(this.room.w * ROOM_SIZE / 2 - DOOR_THICKNESS);
				this.h = DOOR_WIDTH;
				break;
			case "s":
				this.dy = this.room.h * ROOM_SIZE / 2 - DOOR_THICKNESS;
				this.w = DOOR_WIDTH;
				break;
			case "n":
				this.dy = -(this.room.h * ROOM_SIZE / 2 - DOOR_THICKNESS);
				this.w = DOOR_WIDTH;
				break;
		}
	}

	makeBsp() {
		let door_geo = new THREE.CubeGeometry(DOOR_WIDTH, DOOR_WIDTH, DOOR_HEIGHT);
		let door_mesh = new THREE.Mesh(door_geo);
		door_mesh.position.set(this.dx, this.dy, -(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5);
		return new csg.ThreeBSP(door_mesh);
	}

	makeMesh() {
		let door_geo = new THREE.CubeGeometry(this.w, this.h, DOOR_HEIGHT);
		util.shadeGeo(door_geo, LIGHT, this.room.fg);
		let door_mesh = new THREE.Mesh(door_geo,
			new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.FaceColors }));
		//door_mesh.position.set(x + dx, y + dy, movement.ROOM_DEPTH - (ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5);
		door_mesh.position.set(this.dx, this.dy, -(ROOM_SIZE - DOOR_HEIGHT - WALL_THICKNESS) * .5);
		door_mesh["name"] = "door_" + this.dir;
		door_mesh["type"] = "door";
		door_mesh["dir"] = this.dir;
		return door_mesh;
	}
}

export class Room {
	constructor(w, h, bg, fg, doors, elevator) {
		this.w = w;
		this.h = h;
		this.bg = new THREE.Color(bg);
		this.fg = new THREE.Color(fg);
		this.doors = {};
		for(let dir in doors) {
			// todo: handle case where door is a list of doors
			this.doors[dir] = new Door(this, dir);
		}
		this.elevator = elevator;
		this.sector = null;
	}

	create(sector, x, y) {
		this.sector = sector;

		var room_geometry = new THREE.CubeGeometry( this.w * ROOM_SIZE, this.h * ROOM_SIZE, ROOM_SIZE );
		var room_mesh = new THREE.Mesh( room_geometry );
		var room_bsp = new csg.ThreeBSP( room_mesh );

		var inner_geometry = new THREE.CubeGeometry( this.w * ROOM_SIZE - WALL_THICKNESS, this.h * ROOM_SIZE - WALL_THICKNESS, ROOM_SIZE - WALL_THICKNESS );
		var inner_mesh = new THREE.Mesh( inner_geometry );
		var inner_bsp = new csg.ThreeBSP( inner_mesh );

		var subtract_bsp = room_bsp.subtract( inner_bsp );

		// door cutouts
		for(let dir in this.doors) {
			subtract_bsp = subtract_bsp.subtract(this.doors[dir].makeBsp());
		}

		this.mat = new THREE.MeshBasicMaterial({ color: this.bg, side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
		this.mesh = subtract_bsp.toMesh( this.mat );
		this.mesh.position.set(x, y, movement.ROOM_DEPTH);
		this.mesh["name"] = "room_wall";
		this.mesh["type"] = "wall";
		this.geo = this.mesh.geometry;
		this.geo.computeVertexNormals();
		util.shadeGeo(this.geo, LIGHT, this.bg);

		// actual doors
		for(let dir in this.doors) {
			this.mesh.add(this.doors[dir].makeMesh());
		}

		this.sector.add( this.mesh );

		if(this.elevator) this.makeElevator(x, y);

		this.mesh.updateMatrix();
		this.mesh.updateMatrixWorld();
		this.worldPos = this.mesh.getWorldPosition();
	}

	makeElevator(x, y) {
		let z = -movement.ROOM_DEPTH - ROOM_SIZE*.5 - 0.2;
		let stripes = 15;
		this.lift_geo = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, z, 1, 1, stripes);
		let dark = new THREE.Color("#cccc88");
		let light = new THREE.Color("#ffffcc");
		for (var i = 0; i < this.lift_geo.faces.length; i++) {
			let f = this.lift_geo.faces[i];
			let v = [this.lift_geo.vertices[f.a], this.lift_geo.vertices[f.b], this.lift_geo.vertices[f.c]].
				reduce(function(previous, current){
					return previous.z < current.z ? previous : current;
				});
			f.color = ((v.z / stripes)|0) % 2 == 0 ? dark.clone() : light.clone();
		}
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
		this.sector.remove(this.mesh);
		this.geo.dispose();
		this.mat.dispose();
		if(this.elevator) {
			this.sector.remove(this.lift_mesh);
			this.lift_geo.dispose();
			this.lift_mat.dispose();
		}
	}
}