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
		this.rooms = [];
		this.doors = [];
		this.objects = [];
		this.cursor = $("#cursor");
		this.size = this.cursor.width();
		this.viewport = $("#visual");
		this.roomsChanged = false;
		$(".swatch").first().addClass("active");
		this.roomColor = rgb2hex($(".swatch").first().css("background-color"));
		$("#visual").mousedown(bind(this, function(event) {
			this.x = (event.clientX / this.size)|0;
			this.y = (event.clientY / this.size)|0;
			$("#cursor").css({
				left: (this.x * this.size) + "px",
				top: (this.y * this.size) + "px"
			});
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
				case 82: this.startRoom(); break;
				case 27: this.deleteRoom(); break;
				case 13: this.createRoom(); break;
				default: handled = false;
			}
			if(this.x < 0) this.x = 0;
			if(this.y < 0) this.y = 0;
			$("#cursor").css({
				left: (this.x * this.size) + "px",
				top: (this.y * this.size) + "px"
			});
			this.render();

			this.scrollCursorIntoView();

			if(handled) event.preventDefault();
			return !handled;
		}));
		$("#load").click(bind(this, function(event) {
			var d = JSON.parse($("#editor").val());
			this.rooms = d.rooms || [];
			this.doors = d.doors || [];
			this.objects = d.objects || [];
			this.roomsChanged = true;
			this.render();
			return false;
		}));
		$(".swatch").click(bind(this, function(event) {
			$(".swatch").removeClass("active");
			$(event.currentTarget).addClass("active");
			this.roomColor = rgb2hex($(event.currentTarget).css("background-color"));
			var index = this.getRoomIndex();
			if(index > -1) {
				this.rooms[index].color = this.roomColor;
				this.roomsChanged = true;
			}
			this.render();
		}));
		$("#add_object").click(bind(this, function(event) {
			var index = this.getRoomIndex();
			if(index > -1) {
				var rot = $("#rot").val();
				try {
					rot = parseFloat(rot, 10);
				} catch(exc) {
					rot = 0;
				}
				this.objects.push({x:this.x, y:this.y, object:$("#objects").val(), room: index, rot: rot});
				this.roomsChanged = true;
				this.render();
			}
		}));
		$("#set_door_type").click(bind(this, function(event) {
			var index = this.getDoorIndex();
			if(index > -1) {
				this.doors[index].key = $("#doors").val();
				this.roomsChanged = true;
				this.render();
			}
		}));
		$("#cave").click(bind(this, function(event) {
			var index = this.getRoomIndex();
			if(index > -1) {
				this.rooms[index].cave = $("#cave").is(":checked");
				this.roomsChanged = true;
				this.render();
			}
		}));
	};

	Editor.prototype.getDoorIndex = function() {
		for(var i = 0; i < this.doors.length; i++) {
			if(this.x == this.doors[i].x && this.y == this.doors[i].y) {
				return i;
			}
		}
		return -1;
	};

	Editor.prototype.getRoomIndex = function() {
		for(var i = 0; i < this.rooms.length; i++) {
			var r = this.rooms[i];
			if (this.x >= r.x && this.y >= r.y && this.x < r.x + r.w && this.y < r.y + r.h) {
				return i;
			}
		}
		return -1;
	};

	Editor.prototype.deleteRoom = function() {
		this.sx = this.sy = -1;

		var done = false;
		for(var i = 0; i < this.objects.length; i++) {
			if(this.objects[i].x == this.x && this.objects[i].y == this.y) {
				this.objects.splice(i, 1);
				this.roomsChanged = true;
				done = true;
				break;
			}
		}

		if(!done) {
			var index = this.getRoomIndex();
			if (index > -1) {
				var a = [];
				for (var i = 0; i < this.objects.length; i++) {
					if (this.objects[i].room != index) a.push(this.objects[i]);
				}
				this.objects = a;
				this.rooms.splice(index, 1);
				this.roomsChanged = true;
			}
		}
	};

	Editor.prototype.startRoom = function() {
		this.sx = this.x;
		this.sy = this.y;
	};

	Editor.prototype.createRoom = function() {
		if(this.sx > -1) {
			var sx = Math.min(this.x, this.sx);
			var sy = Math.min(this.y, this.sy);
			var w = Math.abs(this.x - this.sx) + 1;
			var h = Math.abs(this.y - this.sy) + 1;
			this.rooms.push({
				x: sx,
				y: sy,
				w: w,
				h: h,
				color: this.roomColor,
				cave: $("#cave").is(":checked")
			});
			this.sx = this.sy = -1;
			this.roomsChanged = true;
		}
	};

	Editor.prototype.render = function() {
		if(this.roomsChanged) {
			$(".room", this.viewport).remove();
			for (var i = 0; i < this.rooms.length; i++) {
				var room = this.rooms[i];
				this.viewport.append("<div class='room" + (room.cave ? ' cave' : '') + "'></div>");
				$(".room", this.viewport).last().css({
					left: (room.x * this.size) + "px",
					top: (room.y * this.size) + "px",
					width: (room.w * this.size) + "px",
					height: (room.h * this.size) + "px",
					background: room.color
				});
			}

			this.findDoors();
			$(".door", this.viewport).remove();
			for (var i = 0; i < this.doors.length; i++) {
				var door = this.doors[i];
				this.viewport.append("<div class='door'></div>");
				if(door.key != "") $(".door", this.viewport).last().addClass(door.key);
				$(".door", this.viewport).last().css({
					left: (door.x * this.size + this.getDoorDx(door.dir)) + "px",
					top: (door.y * this.size + this.getDoorDy(door.dir)) + "px"
				});
			}

			$(".object", this.viewport).remove();
			for(var i = 0; i < this.objects.length; i++) {
				var o = this.objects[i];
				this.viewport.append("<div class='object " + o.object + "'></div>");
				$(".object", this.viewport).last().css({
					left: (o.x * this.size) + "px",
					top: (o.y * this.size) + "px"
				});
			}

			$("#editor").val(JSON.stringify({rooms: this.rooms, doors: this.doors, objects: this.objects }));
		}
		if(this.sx > -1) {
			if($(".room.active").length == 0) {
				this.viewport.append("<div class='room active'></div>");
			}
			var sx = Math.min(this.x, this.sx);
			var sy = Math.min(this.y, this.sy);
			var w = Math.abs(this.x - this.sx) + 1;
			var h = Math.abs(this.y - this.sy) + 1;
			$(".room.active", this.viewport).last().css({
				left: (sx * this.size) + "px",
				top: (sy * this.size) + "px",
				width: (w * this.size) + "px",
				height: (h * this.size) + "px",
				background: this.roomColor
			});
		} else {
			if($(".room.active").length > 0) {
				$(".room.active").remove();
			}
		}
	};

	Editor.prototype.findDoors = function() {
		var seen = {};

		// remember the keys
		var keys = {};
		for(var i = 0; i < this.doors.length; i++) {
			var door = this.doors[i];
			keys[door.roomA + ":" + door.roomB] = door.key;
		}

		// reset the doors
		this.doors = [];
		for(var i = 0; i < this.rooms.length; i++) {
			var a = this.rooms[i];
			for(var t = 0; t < this.rooms.length; t++) {
				if(i != t) {
					// only process each a:b rooms combo once
					var key = Math.min(i, t) + ":" + Math.max(i, t);
					if(!seen[key]) {
						seen[key] = true;
						var b = this.rooms[t];
						var x, y, dir;
						dir = null;
						if (a.y == b.y + b.h) {
							dir = "n";
							y = a.y;
							x = this.getCommonValue(a.x, a.w, b.x, b.w);
						}
						if (a.y + a.h == b.y) {
							dir = "s";
							y = a.y + a.h - 1;
							x = this.getCommonValue(a.x, a.w, b.x, b.w);
						}
						if (a.x == b.x + b.w) {
							dir = "w";
							x = a.x;
							y = this.getCommonValue(a.y, a.h, b.y, b.h);
						}
						if (a.x + a.w == b.x) {
							dir = "e";
							x = a.x + a.w - 1;
							y = this.getCommonValue(a.y, a.h, b.y, b.h);
						}

						if(dir && x > -1 && y > -1) {
							this.doors.push({x: x, y: y, dir: dir, roomA: i, roomB: t, key: keys[key] == null ? "" : keys[key]});
						}
					}
				}
			}
		}
	};

	Editor.prototype.getCommonValue = function(a, aw, b, bw) {
		if(b < a) {
			var tmp = b; b = a; a = tmp;
			tmp = bw; bw = aw; aw = tmp;
		}
		return a <= b && a + aw > b ? b + ((.5 * Math.min(bw, (a + aw - b)))|0) : -1;
	};

	Editor.prototype.getDoorDx = function(dir) {
		//if(dir == "n" || dir == "s") return 0;
		//return dir == "w" ? -this.size/2 : this.size/2;
		return this.size * .25;
	};

	Editor.prototype.getDoorDy = function(dir) {
		//if(dir == "e" || dir == "w") return 0;
		//return dir == "n" ? -this.size/2 : this.size/2;
		return this.size * .25;
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

