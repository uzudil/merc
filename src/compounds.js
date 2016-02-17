import * as room from 'room'

// edit these via: http://localhost:8000/compound_editor/rooms.html
export const LEVELS = {
	"9,2": {"rooms":[{"x":23,"y":11,"w":8,"h":10,"color":"#ffcccc"},{"x":31,"y":14,"w":15,"h":4,"color":"#ccffcc"},{"x":20,"y":13,"w":3,"h":3,"color":"#ffccff"},{"x":20,"y":17,"w":3,"h":3,"color":"#ccccff"},{"x":46,"y":15,"w":2,"h":2,"color":"#ccffff"},{"x":33,"y":12,"w":2,"h":2,"color":"#ccccff"},{"x":37,"y":12,"w":2,"h":2,"color":"#ffcccc"},{"x":41,"y":12,"w":2,"h":2,"color":"#ffffcc"},{"x":41,"y":18,"w":2,"h":2,"color":"#ffccff"},{"x":37,"y":18,"w":2,"h":2,"color":"#ffcc88"},{"x":33,"y":18,"w":2,"h":2,"color":"#ff8866"},{"x":25,"y":21,"w":4,"h":12,"color":"#ffffcc"},{"x":29,"y":29,"w":5,"h":2,"color":"#ff8866"},{"x":29,"y":25,"w":5,"h":2,"color":"#ffcc88"},{"x":20,"y":25,"w":5,"h":2,"color":"#cccccc"},{"x":20,"y":29,"w":5,"h":2,"color":"#ccffff"}],"doors":[{"x":30,"y":16,"dir":"e","roomA":0,"roomB":1,"key":""},{"x":23,"y":14,"dir":"w","roomA":0,"roomB":2,"key":""},{"x":23,"y":18,"dir":"w","roomA":0,"roomB":3,"key":"keyb"},{"x":27,"y":20,"dir":"s","roomA":0,"roomB":11,"key":"keya"},{"x":45,"y":16,"dir":"e","roomA":1,"roomB":4,"key":""},{"x":34,"y":14,"dir":"n","roomA":1,"roomB":5,"key":""},{"x":38,"y":14,"dir":"n","roomA":1,"roomB":6,"key":""},{"x":42,"y":14,"dir":"n","roomA":1,"roomB":7,"key":""},{"x":42,"y":17,"dir":"s","roomA":1,"roomB":8,"key":""},{"x":38,"y":17,"dir":"s","roomA":1,"roomB":9,"key":""},{"x":34,"y":17,"dir":"s","roomA":1,"roomB":10,"key":""},{"x":28,"y":30,"dir":"e","roomA":11,"roomB":12,"key":""},{"x":28,"y":26,"dir":"e","roomA":11,"roomB":13,"key":""},{"x":25,"y":26,"dir":"w","roomA":11,"roomB":14,"key":""},{"x":25,"y":30,"dir":"w","roomA":11,"roomB":15,"key":""}],"objects":[{"x":41,"y":12,"object":"keya","room":7},{"x":20,"y":30,"object":"keyb","room":15},{"x":20,"y":18,"object":"pres","room":3},{"x":29,"y":25,"object":"pres","room":13},{"x":20,"y":25,"object":"pres","room":14}]},
	"d9,42": {"rooms":[{"x":12,"y":8,"w":3,"h":3,"color":"#ffcccc"},{"x":15,"y":9,"w":8,"h":1,"color":"#ffffcc"},{"x":23,"y":8,"w":3,"h":3,"color":"#ccffcc"},{"x":24,"y":11,"w":1,"h":4,"color":"#ccccff"},{"x":21,"y":15,"w":7,"h":3,"color":"#ccffff"},{"x":18,"y":16,"w":3,"h":1,"color":"#cccccc"},{"x":28,"y":16,"w":3,"h":1,"color":"#cccccc"},{"x":31,"y":15,"w":3,"h":3,"color":"#ffccff"},{"x":15,"y":15,"w":3,"h":3,"color":"#ffcc88"},{"x":23,"y":18,"w":3,"h":5,"color":"#ccffcc"},{"x":24,"y":23,"w":1,"h":3,"color":"#ffcccc"},{"x":23,"y":26,"w":3,"h":8,"color":"#ccccff","cave":true},{"x":26,"y":27,"w":6,"h":2,"color":"#cccccc","cave":true},{"x":26,"y":32,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":29,"y":32,"w":3,"h":6,"color":"#ffcc88","cave":true},{"x":32,"y":37,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":32,"y":33,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":33,"y":30,"w":4,"h":3,"color":"#ffffcc","cave":true},{"x":30,"y":25,"w":1,"h":2,"color":"#cccccc","cave":true},{"x":29,"y":23,"w":10,"h":2,"color":"#cccccc","cave":true},{"x":35,"y":27,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":36,"y":28,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":37,"y":32,"w":2,"h":1,"color":"#cccccc","cave":true},{"x":38,"y":33,"w":2,"h":3,"color":"#cccccc","cave":true},{"x":40,"y":27,"w":4,"h":3,"color":"#ff8866","cave":true},{"x":41,"y":30,"w":1,"h":4,"color":"#cccccc","cave":true},{"x":40,"y":33,"w":1,"h":1,"color":"#cccccc","cave":true},{"x":39,"y":24,"w":5,"h":1,"color":"#cccccc","cave":true},{"x":41,"y":25,"w":2,"h":2,"color":"#cccccc","cave":true},{"x":36,"y":20,"w":2,"h":3,"color":"#ffccff","cave":true},{"x":31,"y":20,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":26,"y":35,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":27,"y":36,"w":1,"h":5,"color":"#cccccc","cave":true},{"x":28,"y":39,"w":8,"h":1,"color":"#cccccc","cave":true},{"x":24,"y":38,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":23,"y":34,"w":1,"h":5,"color":"#cccccc","cave":true},{"x":22,"y":27,"w":1,"h":1,"color":"#cccccc","cave":true},{"x":36,"y":37,"w":3,"h":4,"color":"#ccffcc","cave":true},{"x":38,"y":36,"w":1,"h":1,"color":"#cccccc","cave":true},{"x":33,"y":34,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":32,"y":21,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":39,"y":39,"w":4,"h":2,"color":"#cccccc","cave":true},{"x":43,"y":33,"w":1,"h":7,"color":"#cccccc","cave":true},{"x":40,"y":35,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":13,"y":11,"w":1,"h":10,"color":"#ccffff"},{"x":13,"y":24,"w":1,"h":8,"color":"#ccffff"},{"x":14,"y":31,"w":9,"h":1,"color":"#cccccc","cave":true},{"x":10,"y":21,"w":7,"h":3,"color":"#ccffff"},{"x":31,"y":40,"w":1,"h":2,"color":"#cccccc","cave":true},{"x":17,"y":32,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":19,"y":28,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":17,"y":35,"w":6,"h":1,"color":"#cccccc","cave":true}],"doors":[{"x":14,"y":9,"dir":"e","roomA":0,"roomB":1,"key":""},{"x":13,"y":10,"dir":"s","roomA":0,"roomB":44,"key":""},{"x":22,"y":9,"dir":"e","roomA":1,"roomB":2,"key":""},{"x":24,"y":10,"dir":"s","roomA":2,"roomB":3,"key":""},{"x":24,"y":14,"dir":"s","roomA":3,"roomB":4,"key":""},{"x":21,"y":16,"dir":"w","roomA":4,"roomB":5,"key":""},{"x":27,"y":16,"dir":"e","roomA":4,"roomB":6,"key":""},{"x":24,"y":17,"dir":"s","roomA":4,"roomB":9,"key":"keyc"},{"x":18,"y":16,"dir":"w","roomA":5,"roomB":8,"key":""},{"x":30,"y":16,"dir":"e","roomA":6,"roomB":7,"key":""},{"x":24,"y":22,"dir":"s","roomA":9,"roomB":10,"key":""},{"x":24,"y":25,"dir":"s","roomA":10,"roomB":11,"key":""},{"x":25,"y":28,"dir":"e","roomA":11,"roomB":12,"key":""},{"x":25,"y":32,"dir":"e","roomA":11,"roomB":13,"key":""},{"x":23,"y":33,"dir":"s","roomA":11,"roomB":35,"key":""},{"x":23,"y":27,"dir":"w","roomA":11,"roomB":36,"key":""},{"x":23,"y":31,"dir":"w","roomA":11,"roomB":46,"key":""},{"x":30,"y":27,"dir":"n","roomA":12,"roomB":18,"key":""},{"x":28,"y":32,"dir":"e","roomA":13,"roomB":14,"key":""},{"x":31,"y":37,"dir":"e","roomA":14,"roomB":15,"key":""},{"x":31,"y":33,"dir":"e","roomA":14,"roomB":16,"key":""},{"x":29,"y":35,"dir":"w","roomA":14,"roomB":31,"key":""},{"x":35,"y":37,"dir":"e","roomA":15,"roomB":37,"key":""},{"x":33,"y":37,"dir":"n","roomA":15,"roomB":39,"key":""},{"x":34,"y":33,"dir":"n","roomA":16,"roomB":17,"key":""},{"x":33,"y":33,"dir":"s","roomA":16,"roomB":39,"key":""},{"x":35,"y":30,"dir":"n","roomA":17,"roomB":20,"key":""},{"x":36,"y":32,"dir":"e","roomA":17,"roomB":22,"key":""},{"x":30,"y":25,"dir":"n","roomA":18,"roomB":19,"key":""},{"x":38,"y":24,"dir":"e","roomA":19,"roomB":27,"key":""},{"x":37,"y":23,"dir":"n","roomA":19,"roomB":29,"key":""},{"x":31,"y":23,"dir":"n","roomA":19,"roomB":30,"key":""},{"x":35,"y":28,"dir":"e","roomA":20,"roomB":21,"key":""},{"x":39,"y":28,"dir":"e","roomA":21,"roomB":24,"key":""},{"x":38,"y":32,"dir":"s","roomA":22,"roomB":23,"key":""},{"x":39,"y":33,"dir":"e","roomA":23,"roomB":26,"key":""},{"x":38,"y":35,"dir":"s","roomA":23,"roomB":38,"key":""},{"x":39,"y":35,"dir":"e","roomA":23,"roomB":43,"key":""},{"x":41,"y":29,"dir":"s","roomA":24,"roomB":25,"key":""},{"x":42,"y":27,"dir":"n","roomA":24,"roomB":28,"key":""},{"x":41,"y":33,"dir":"w","roomA":25,"roomB":26,"key":""},{"x":42,"y":24,"dir":"s","roomA":27,"roomB":28,"key":""},{"x":36,"y":21,"dir":"w","roomA":29,"roomB":40,"key":""},{"x":31,"y":21,"dir":"e","roomA":30,"roomB":40,"key":""},{"x":27,"y":35,"dir":"s","roomA":31,"roomB":32,"key":""},{"x":27,"y":39,"dir":"e","roomA":32,"roomB":33,"key":""},{"x":27,"y":38,"dir":"w","roomA":32,"roomB":34,"key":""},{"x":35,"y":39,"dir":"e","roomA":33,"roomB":37,"key":""},{"x":31,"y":39,"dir":"s","roomA":33,"roomB":48,"key":""},{"x":24,"y":38,"dir":"w","roomA":34,"roomB":35,"key":""},{"x":23,"y":35,"dir":"w","roomA":35,"roomB":51,"key":""},{"x":38,"y":37,"dir":"n","roomA":37,"roomB":38,"key":""},{"x":38,"y":40,"dir":"e","roomA":37,"roomB":41,"key":""},{"x":42,"y":39,"dir":"e","roomA":41,"roomB":42,"key":""},{"x":43,"y":35,"dir":"w","roomA":42,"roomB":43,"key":""},{"x":13,"y":20,"dir":"s","roomA":44,"roomB":47,"key":"keyd"},{"x":13,"y":31,"dir":"e","roomA":45,"roomB":46,"key":""},{"x":13,"y":24,"dir":"n","roomA":45,"roomB":47,"key":"keyd"},{"x":17,"y":31,"dir":"s","roomA":46,"roomB":49,"key":""},{"x":19,"y":31,"dir":"n","roomA":46,"roomB":50,"key":""},{"x":17,"y":34,"dir":"s","roomA":49,"roomB":51,"key":""}],"objects":[{"x":15,"y":16,"object":"keyc","room":8},{"x":36,"y":40,"object":"keyd","room":39}]}


};

export function getLevel(sectorX, sectorY) {
	let key = "" + sectorX.toString(16) + "," + sectorY.toString(16);
	console.log("Looking for compound=" + key);
	return new room.Level(LEVELS[key]);
}