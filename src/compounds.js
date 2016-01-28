import * as room from 'room'

// edit these via: http://localhost:8000/compound_editor/rooms.html
export const LEVELS = {
	"9,2": {"rooms":[{"x":23,"y":11,"w":8,"h":10,"color":"#ffcccc"},{"x":31,"y":14,"w":15,"h":4,"color":"#ccffcc"},{"x":20,"y":13,"w":3,"h":3,"color":"#ffccff"},{"x":20,"y":17,"w":3,"h":3,"color":"#ccccff"},{"x":46,"y":15,"w":2,"h":2,"color":"#ccffff"},{"x":33,"y":12,"w":2,"h":2,"color":"#ccccff"},{"x":37,"y":12,"w":2,"h":2,"color":"#ffcccc"},{"x":41,"y":12,"w":2,"h":2,"color":"#ffffcc"},{"x":41,"y":18,"w":2,"h":2,"color":"#ffccff"},{"x":37,"y":18,"w":2,"h":2,"color":"#ffcc88"},{"x":33,"y":18,"w":2,"h":2,"color":"#ff8866"}],"doors":[{"x":30,"y":16,"dir":"e","roomA":0,"roomB":1},{"x":23,"y":14,"dir":"w","roomA":0,"roomB":2},{"x":23,"y":18,"dir":"w","roomA":0,"roomB":3},{"x":45,"y":16,"dir":"e","roomA":1,"roomB":4},{"x":34,"y":14,"dir":"n","roomA":1,"roomB":5},{"x":38,"y":14,"dir":"n","roomA":1,"roomB":6},{"x":42,"y":14,"dir":"n","roomA":1,"roomB":7},{"x":42,"y":17,"dir":"s","roomA":1,"roomB":8},{"x":38,"y":17,"dir":"s","roomA":1,"roomB":9},{"x":34,"y":17,"dir":"s","roomA":1,"roomB":10}],"objects":[{"x":41,"y":12,"object":"keya","room":7}]}
};

export function getLevel(sectorX, sectorY) {
	return new room.Level(LEVELS["" + sectorX + "," + sectorY]);
}
