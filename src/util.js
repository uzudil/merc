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