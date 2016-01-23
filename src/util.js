import THREE from 'three.js';

export function bind(callerObj, method) {
	return function() {
		return method.apply(callerObj, arguments);
	};
}

export function rad2angle(rad) {
	return (rad / Math.PI) * 180.0;
}

export function angle2rad(angle) {
	return (angle / 180.0) * Math.PI;
}

// to use this, use a material with vertexColors: THREE.FaceColors
const LIGHT = new THREE.Vector3(0.5, 0.75, 1.0);
export function shadeGeo(geo, light, color) {
	if(!light) light = LIGHT;
	for (var i = 0; i < geo.faces.length; i++) {
		let f = geo.faces[i];
		if(color) f.color = color.clone();
		else {
			// use the first vertex colors, if given
			if(f.vertexColors && f.vertexColors[0]) {
				f.color.copy(f.vertexColors[0]);
			}
		}
		let a = 0.75 + f.normal.dot(light) * 0.25;
		f.color.multiplyScalar(a);
		// do not use vertex colors
		f.vertexColors = [];
	}
}

export function getOppositeDir(dir) {
	switch(dir) {
		case "n": return "s";
		case "s": return "n";
		case "e": return "w";
		case "w": return "e";
		default: throw "Unknown direction: " + dir;
	}
}

// find an overlapping point between segments: [point1, width1] and [point2, width2]
export function findAnOverlap(p1, w1, p2, w2) {
	// swap if needed
	if(p1 > p2) {
		[p1, p2] = [p2, p1];
		[w1, w2] = [w2, w1];
	}
	let r = 0;
	if(p2 < p1 + w1) {
		r = p2 + (Math.random() * Math.min(w2, (w1 - (p2 - p1))))|0;
	}
	//console.log("overlap of A:", p1, ",", w1, " B:", p2, ",", w2 + " Res:", r);
	return r;

}
