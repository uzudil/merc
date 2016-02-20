var WIDTH = 25;
var HEIGHT = 25;

function bind(callerObj, method) {
	return function() {
		return method.apply(callerObj, arguments);
	};
}

// http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function rgb2hex(rgb) {
	if(!rgb) return "#000000";
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function Editor() {

	Editor.prototype.start = function() {
		this.x = 0;
		this.y = 0;
		this.sx = -1;
		this.sy = -1;
		this.roads = [];
		this.structures = {};
		this.cursor = $("#cursor");
		this.size = this.cursor.width();
		this.viewport = $("#visual");
		this.needsUpdate = false;
		$("#visual").mousedown(bind(this, function(event) {
			this.x = (event.offsetX / this.size)|0;
			this.y = (event.offsetY / this.size)|0;
			this.render();
		}));
		$(document).keydown(bind(this, function(event) {
			if(event.target.id && event.target.id == "editor") return true;

			//console.log(event.which, event.keyCode, event.target);
			var handled = true;

			switch(event.which) {
				case 38: this.y--; break;
				case 40: this.y++; break;
				case 37: this.x--; break;
				case 39: this.x++; break;
				case 83: this.addStructure(); break;
				case 82: this.startRoad(); break;
				case 27: this.deleteRoad(); break;
				case 13: this.createRoad(); break;
				case 66: this.addBridge(); break;
				default: handled = false;
			}
			if(this.x < 0) this.x = 0;
			if(this.y < 0) this.y = 0;
			this.render();

			this.scrollCursorIntoView();

			if(handled) event.preventDefault();
			return !handled;
		}));
		$("#load").click(bind(this, function(event) {
			var d = JSON.parse($("#editor").val());
			this.roads = [];
			var roads = d.roads || [];
			for(var i = 0; i < roads.length; i++) {
				var r = roads[i];
				var o = [r[0], r[1], r[2], r[3]];
				if(r.length > 4) {
					o.push(r[4]);
				} else {
					o.push([]);
				}
				this.roads.push(o);
			}
			this.structures = d.structures || {};
			for(var key in this.structures) {
				for(var i = 0; i < this.structures[key].length; i++) {
					var s = this.structures[key][i];
					if(s.length == 2) {
						s.push(0);
						s.push(0);
						s.push(0);
					}
				}
			}
			this.needsUpdate = true;
			this.render();
			return false;
		}));
		$("#set_bridge").click(bind(this, function(event) {
			this.addBridge();
			return false;
		}));
		$("#add_object").click(bind(this, function(event) {
			this.addStructure();
			return false;
		}));
	};

	Editor.prototype.addStructure = function() {
		var s = $("#structures").val();
		if(this.structures[s] == null) {
			this.structures[s] = [];
		}

		var dx, dy, rot;
		try {
			dx = parseFloat($("#dx").val(), 10);
		} catch(exc) {
		}
		try {
			dy = parseFloat($("#dy").val(), 10);
		} catch(exc) {
		}
		try {
			rot = parseFloat($("#rotation").val(), 10);
		} catch(exc) {
		}
		dx = dx || 0; if(isNaN(dx)) dx = 0;
		dy = dy || 0; if(isNaN(dy)) dy = 0;
		rot = rot || 0; if(isNaN(rot)) rot = 0;
		this.structures[s].push([this.x, this.y, dx, dy, rot ]);
		this.needsUpdate = true;
		this.render();
	};

	Editor.prototype.addBridge = function() {
		var i = this.getRoadIndex();
		if(i > -1) {
			this.roads[i][4].push([this.x, this.y]);
			this.needsUpdate = true;
			this.render();
		}
	};

	Editor.prototype.getRoadIndex = function() {
		for(var i = 0; i < this.roads.length; i++) {
			var r = this.roads[i];
			if (this.x >= r[0] && this.y >= r[1] && this.x <= r[0] + r[2] && this.y <= r[1] + r[3]) {
				return i;
			}
		}
		return -1;
	};

	Editor.prototype.deleteRoad = function() {
		this.sx = this.sy = -1;

		var done = false;
		for(var key in this.structures) {
			for(var i = 0; i < this.structures[key].length; i++) {
				var s = this.structures[key][i];
				if(this.x == s[0] && this.y == s[1]) {
					this.structures[key].splice(i, 1);
					done = true;
					break;
				}
			}
		}
		if(!done) {
			var index = this.getRoadIndex();
			if (index > -1) {

				for (var t = 0; t < this.roads[index][4].length; t++) {
					var bridge = this.roads[index][4][t];
					if (this.x == bridge[0] && this.y == bridge[1]) {
						this.roads[index][4].splice(t, 1);
						done = true;
						break;
					}
				}
				if (!done) this.roads.splice(index, 1);
				this.needsUpdate = true;
			}
		}
	};

	Editor.prototype.startRoad = function() {
		this.sx = this.x;
		this.sy = this.y;
	};

	Editor.prototype.createRoad = function() {
		if(this.sx > -1) {
			var sx = Math.min(this.x, this.sx);
			var sy = Math.min(this.y, this.sy);
			var w = Math.abs(this.x - this.sx) + 1;
			var h = Math.abs(this.y - this.sy) + 1;
			if(w > h) {
				h = 0
			} else {
				w = 0;
			}
			this.roads.push([sx, sy, w, h, []]);
			this.sx = this.sy = -1;
			this.needsUpdate = true;
		}
	};

	Editor.prototype.render = function() {

		$("#cursor").css({
			left: (this.x * this.size) + "px",
			top: (this.y * this.size) + "px"
		});

		$("#coords").text(this.x.toString(16) + "-" + this.y.toString(16));
		$("#current_structure").text("");
		out:
		for(var key in this.structures) {
			for (var i = 0; i < this.structures[key].length; i++) {
				var s = this.structures[key][i];
				if (this.x == s[0] && this.y == s[1]) {
					$("#current_structure").text(key);
					break out;
				}
			}
		}

		if(this.needsUpdate) {
			$(".road", this.viewport).remove();
			$(".bridge", this.viewport).remove();
			for (var i = 0; i < this.roads.length; i++) {
				var road = this.roads[i];
				this.viewport.append("<div class='road'></div>");
				$(".road", this.viewport).last().css({
					left: (road[0] * this.size) + "px",
					top: (road[1] * this.size) + "px",
					width: (road[2] * this.size) + "px",
					height: (road[3] * this.size) + "px"
				});
				for(var t = 0; t < road[4].length; t++) {
					var bridge = road[4][t];
					this.viewport.append("<div class='bridge'></div>");
					$(".bridge", this.viewport).last().css({
						left: (bridge[0] * this.size) + "px",
						top: (bridge[1] * this.size) + "px",
						width: (this.size) + "px",
						height: (this.size) + "px"
					});
				}
			}

			$(".structure", this.viewport).remove();
			for (var key in this.structures) {
				for(var i = 0; i < this.structures[key].length; i++) {
					var struc = this.structures[key][i];
					this.viewport.append("<div class='structure " + key + "'></div>");
					$(".structure", this.viewport).last().css({
						left: (struc[0] * this.size) + "px",
						top: (struc[1] * this.size) + "px",
						width: (this.size) + "px",
						height: (this.size) + "px",
						background: $("#structures option:contains('" + key + "')").data("bg")
					});
				}
			}

			$("#editor").val(JSON.stringify({
				roads: this.roads,
				structures: this.structures
			}));
		}
		if(this.sx > -1) {
			if($(".road.active").length == 0) {
				this.viewport.append("<div class='road active'></div>");
			}
			var sx = Math.min(this.x, this.sx);
			var sy = Math.min(this.y, this.sy);
			var w = Math.abs(this.x - this.sx) + 1;
			var h = Math.abs(this.y - this.sy) + 1;
			if(w > h) {
				h = 0
			} else {
				w = 0;
			}
			$(".road.active", this.viewport).last().css({
				left: (sx * this.size) + "px",
				top: (sy * this.size) + "px",
				width: (w * this.size) + "px",
				height: (h * this.size) + "px"
			});
		} else {
			if($(".road.active").length > 0) {
				$(".road.active").remove();
			}
		}
	};

	Editor.prototype.scrollCursorIntoView = function() {
		var cursorRect = this.cursor[0].getBoundingClientRect();
		var viewportRect = this.viewport[0].getBoundingClientRect();
		if(cursorRect.left < viewportRect.left || cursorRect.right > viewportRect.right ||
			cursorRect.top < viewportRect.top || cursorRect.bottom > viewportRect.bottom) {
			this.cursor[0].scrollIntoView();
		}
	};
}

