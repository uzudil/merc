import * as room from 'room'

// edit these via: http://localhost:8000/compound_editor/rooms.html
export const LEVELS = {
	"9,2": {"rooms":[{"x":23,"y":11,"w":8,"h":10,"color":"#ffcccc"},{"x":31,"y":14,"w":15,"h":4,"color":"#ccffcc"},{"x":26,"y":21,"w":3,"h":3,"color":"#ffffcc"},{"x":26,"y":8,"w":3,"h":3,"color":"#ccffcc"},{"x":20,"y":13,"w":3,"h":3,"color":"#ffccff"},{"x":20,"y":17,"w":3,"h":3,"color":"#ccccff"},{"x":29,"y":22,"w":19,"h":1,"color":"#cccccc"},{"x":46,"y":15,"w":2,"h":2,"color":"#ccffff"},{"x":48,"y":8,"w":3,"h":16,"color":"#ccccff"},{"x":29,"y":9,"w":19,"h":1,"color":"#ffffcc"},{"x":42,"y":10,"w":2,"h":4,"color":"#ffccff"},{"x":35,"y":10,"w":2,"h":4,"color":"#ccccff"},{"x":35,"y":18,"w":2,"h":4,"color":"#ffcc88"},{"x":42,"y":18,"w":2,"h":4,"color":"#ffffcc"}],"doors":[{"x":30,"y":16,"dir":"e","roomA":0,"roomB":1},{"x":27,"y":20,"dir":"s","roomA":0,"roomB":2},{"x":27,"y":11,"dir":"n","roomA":0,"roomB":3},{"x":23,"y":14,"dir":"w","roomA":0,"roomB":4},{"x":23,"y":18,"dir":"w","roomA":0,"roomB":5},{"x":45,"y":16,"dir":"e","roomA":1,"roomB":7},{"x":43,"y":14,"dir":"n","roomA":1,"roomB":10},{"x":36,"y":14,"dir":"n","roomA":1,"roomB":11},{"x":36,"y":17,"dir":"s","roomA":1,"roomB":12},{"x":43,"y":17,"dir":"s","roomA":1,"roomB":13},{"x":28,"y":22,"dir":"e","roomA":2,"roomB":6},{"x":28,"y":9,"dir":"e","roomA":3,"roomB":9},{"x":47,"y":22,"dir":"e","roomA":6,"roomB":8},{"x":36,"y":22,"dir":"n","roomA":6,"roomB":12},{"x":43,"y":22,"dir":"n","roomA":6,"roomB":13},{"x":47,"y":16,"dir":"e","roomA":7,"roomB":8},{"x":48,"y":9,"dir":"w","roomA":8,"roomB":9},{"x":43,"y":9,"dir":"s","roomA":9,"roomB":10},{"x":36,"y":9,"dir":"s","roomA":9,"roomB":11}]}
};

export function getLevel(sectorX, sectorY) {
	return new room.Level(LEVELS["" + sectorX + "," + sectorY]);
}
