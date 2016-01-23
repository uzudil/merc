import * as room from 'room'

export const LEVELS = {
	"9,2": new room.Level([
		new room.Room("_start_", 0, 6, 4, 4, "#eeddd8", true),
		new room.Room("meeting_room", 0, 0, 2, 6, "#ddeedd"),
		new room.Room("bunks", 4, 6, 3, 9, "#ddeed8"),
		new room.Room("storage_room", 7, 7, 2, 2, "#d8ddee"),
		new room.Room("cable_room", 7, 11, 2, 2, "#ddeed8"),
		new room.Room("exercise_room", 1, 14, 3, 2, "#d8d8dd")
	], [
		new room.Door(0, 6, "n", "_start_", "meeting_room", "#cc8800"),
		new room.Door(3, 7, "e", "_start_", "bunks", "#cc8800"),
		new room.Door(6, 8, "e", "bunks", "storage_room", "#cc8800"),
		new room.Door(6, 12, "e", "bunks", "cable_room", "#cc8800"),
		new room.Door(4, 14, "w", "bunks", "exercise_room", "#cc8800")
	])
};

export function getLevel(sectorX, sectorY) {
	return LEVELS["" + sectorX + "," + sectorY];
}
