import THREE from 'three.js';
import $ from 'jquery'

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
		let a = 0.75 + Math.max(-1, Math.min(f.normal.dot(light), 1)) * 0.25;
		f["original_color"] = f.color.getHex();
		f["light_mod"] = a;
		f.color.multiplyScalar(a);
		// do not use vertex colors
		f.vertexColors = [];
	}
}

export function setLightPercent(mesh, light, percent) {
	let geo = mesh.geometry;
	for (var i = 0; i < geo.faces.length; i++) {
		let f = geo.faces[i];
		let a = 0.75 * percent + Math.max(-1, Math.min(f.normal.dot(light), 1)) * 0.25;
		f.color.setHex(f["original_color"]);
		f.color.multiplyScalar(a);
	}
	updateColors(mesh);
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

export function toHex(num, digits) {
	let s = num.toString(16);
	if(digits) {
		s = "000000000000000000" + s;
		s = s.substr(s.length - digits);
	}
	return s;
}

export function toggleColor(object, colorFrom, colorTo) {
	//console.log("Changing color!");
	for (var i = 0; i < object.geometry.faces.length; i++) {
		let f = object.geometry.faces[i];
		//console.log("face color=" + f.original_color.toString(16) + " vs " + colorFrom.toString(16) + " eq=" + (f.original_color == colorFrom));
		if(f.original_color == colorFrom) {
			let c = new THREE.Color(colorTo);
			c.multiplyScalar(f.light_mod);
			f.color.setRGB(c.r, c.g, c.b);
			f.original_color = colorTo;
		}
	}
	updateColors(object);
}

export function updateColors(mesh) {
	mesh.material.needsUpdate = true;
	mesh.geometry.needsUpdate = true;
	mesh.geometry.colorsNeedUpdate = true;
	mesh.geometry.elementsNeedUpdate = true;
	mesh.needsUpdate = true;
}

// from http://www.henryalgus.com/reading-binary-files-using-jquery-ajax/
export function initBinaryLoader() {
	$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
		// check for conditions and support for blob / arraybuffer response type
		if (window.FormData &&
			((options.dataType && (options.dataType == 'binary')) ||
			(options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) ||
			(window.Blob && options.data instanceof Blob)))
			)) {
			return {
				// create new XMLHttpRequest
				send: function(headers, callback){
					// setup all variables
					var xhr = new XMLHttpRequest(),
						url = options.url,
						type = options.type,
						async = options.async || true,
					// blob or arraybuffer. Default is blob
						dataType = options.responseType || "blob",
						data = options.data || null,
						username = options.username || null,
						password = options.password || null;

					xhr.addEventListener('load', function(){
						var data = {};
						data[options.dataType] = xhr.response;
						// make callback and send data
						callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
					});
					if(options["progress"]) {
						xhr.addEventListener("progress", (evt) => {
							if (evt.lengthComputable) {
								var percentComplete = evt.loaded / evt.total;
								options.progress(percentComplete);
							}
						}, false);
					}

					xhr.open(type, url, async, username, password);

					// setup custom headers
					for (var i in headers ) {
						xhr.setRequestHeader(i, headers[i] );
					}

					xhr.responseType = dataType;
					xhr.send(data);
				},
				abort: function(){
					jqXHR.abort();
				}
			};
		}
	});
}

export function startLoadingUI(waitDivId="wait") {
	window.loadingComplex = true;
	$(".alert").hide();
	$("#loading").show();
	$("#" + waitDivId).show();
}

export function stopLoadingUI() {
	$("#loading").hide();
	$(".wait-alert").hide();
	window.loadingComplex = false;
}

export function setLoadingUIProgress(percent, action) {
	$("#progress-value").css("width", percent + "%");
	setTimeout(action, 100);
}

export function execWithProgress(fxs, waitDivId="wait") {
	startLoadingUI(waitDivId);
	runWithProgress(fxs, 0);
}

function runWithProgress(fxs, index) {
	let p = (((index + 1) / fxs.length * 100)|0);
	console.log("index=" + index + " p=" + p + " length=" + fxs.length);
	setLoadingUIProgress(p, () => {
		fxs[index]();
		if(++index < fxs.length) {
			runWithProgress(fxs, index);
		} else {
			stopLoadingUI();
		}
	})
}
