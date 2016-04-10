import THREE from 'three.js'

export const DEV_MODE = location.hostname == "localhost";
export const START_X = 0x33;
export const START_Y = 0x66;
export const START_Z = 50000;
export const SECTOR_SIZE = 512.0;
export const GRASS_COLOR = new THREE.Color("rgb(39,79,6)");
export const SKY_COLOR = new THREE.Color("rgb(157,159,250)");
export const GAME_DAY = 15 * 60 * 1000; // 15 mins = 1 game day
//export const GAME_DAY = 1 * 40 * 1000; // 15 mins = 1 game day

export const AMBIENT_COLOR = new THREE.Color(0x999999);
export const DIR1_COLOR = new THREE.Color(0xffffff);
export const DIR2_COLOR = new THREE.Color(0xffe0cc);

export const MIN_LIGHT = 0.15;

export const LIGHT1 = {
	0: [38, 38, 38],
	3: [38, 38, 38],
	5: [180, 80, 30],
	8: [255, 255, 255],
	16: [255, 255, 255],
	18: [180, 80, 30],
	20: [38, 38, 38],
	23: [38, 38, 38]
};

export function calcLight(hourOfDay, color, baseColor) {
	let hour = hourOfDay|0;
	let lowHour, highHour;
	let low, high;
	for(lowHour = hour; lowHour >= 0; lowHour--) {
		low = LIGHT1[lowHour];
		if(low) break;
	}
	if(lowHour == 23) {
		high = low;
		highHour = 24;
	} else {
		for(highHour = hour + 1; highHour < 24; highHour++) {
			high = LIGHT1[highHour];
			if(high) break;
		}
	}
	let t = highHour == lowHour ? 1 : (hourOfDay - lowHour)/(highHour - lowHour);
	//console.log("h=" + hourOfDay + " low=" + low + "," + lowHour + " high=" + high + "," + highHour + " t=" + t + " color=" + color.getHexString());
	color.setRGB(
		(low[0] + (high[0] - low[0]) * t)/0xff * baseColor.r,
		(low[1] + (high[1] - low[1]) * t)/0xff * baseColor.g,
		(low[2] + (high[2] - low[2]) * t)/0xff * baseColor.b);
}

export const MATERIAL = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
	vertexColors: THREE.FaceColors,
	shading: THREE.FlatShading
	//overdraw: true
});
export const DOOR_MATERIAL = new THREE.MeshPhongMaterial({
	color: 0xffcc22,
	side: THREE.DoubleSide,
	vertexColors: THREE.FaceColors,
	shading: THREE.FlatShading
	//overdraw: true
});

export const ROOM_SIZE = 50; //game_map.SECTOR_SIZE / 10;
export const DOOR_WIDTH = ROOM_SIZE * .35;
export const DOOR_HEIGHT = ROOM_SIZE * .7;
export const WALL_THICKNESS = 10;

export const CAVES_ENABLED = true; // caves disabled for now: it causes page to crash
export const WALL_SEGMENTS = 2; // making this bigger takes forever to compute
export const CAVE_RAND_FACTOR = 1.25;

export const DOOR_EW = new THREE.CubeGeometry(WALL_THICKNESS * .5, DOOR_WIDTH * 1.5, DOOR_HEIGHT);
DOOR_EW.name = "door_ew";
export const DOOR_NS = new THREE.CubeGeometry(DOOR_WIDTH * 1.5, WALL_THICKNESS * .5, DOOR_HEIGHT);
DOOR_NS.name = "door_ns";
