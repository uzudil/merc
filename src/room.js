import * as movement from 'movement'
import * as game_map from 'game_map'
import * as util from 'util'
import THREE from 'three.js';

export const ROOM_SIZE = 50; //game_map.SECTOR_SIZE / 10;

export class Room {
	constructor(w, h, bg, fg, doors, elevator) {
		this.w = w;
		this.h = h;
		this.bg = new THREE.Color(bg);
		this.fg = new THREE.Color(fg);
		this.doors = doors;
		this.elevator = elevator;
		this.sector = null;
	}

	create(sector, x, y) {
		this.sector = sector;
		this.geo = new THREE.BoxGeometry(this.w * ROOM_SIZE, this.h * ROOM_SIZE, ROOM_SIZE);
		this.mat = new THREE.MeshBasicMaterial({ color: this.bg, side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
		util.shadeGeo(this.geo, null, this.bg);

		this.mesh = new THREE.Mesh(this.geo, this.mat);
		this.mesh.position.set(x, y, movement.ROOM_DEPTH);

		this.sector.add( this.mesh );

		if(this.elevator) {
			let z = -movement.ROOM_DEPTH - ROOM_SIZE*.5 - 0.2;
			this.lift_geo = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, z, 1, 1, 10);
			let dark = new THREE.Color("#cccc88");
			let light = new THREE.Color("#ffffcc");
			for (var i = 0; i < this.lift_geo.faces.length; i++) {
				let f = this.lift_geo.faces[i];
				let v = [this.lift_geo.vertices[f.a], this.lift_geo.vertices[f.b], this.lift_geo.vertices[f.c]].
					reduce(function(previous, current){
						return previous.z < current.z ? previous : current;
					});
				f.color = ((v.z / 10)|0) % 2 == 0 ? dark.clone() : light.clone();
			}
			this.lift_mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
			util.shadeGeo(this.lift_geo, null);
			this.lift_mesh = new THREE.Mesh(this.lift_geo, this.lift_mat);
			this.lift_mesh.position.set(x, y, -z / 2);

			this.sector.add( this.lift_mesh );
		}
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