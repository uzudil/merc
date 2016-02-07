
export class Events {
	constructor(movement) {
		this.movement = movement;
		this.state = {};
		this.EVENTS = {
			"9,2": ()=> {
				if (!this.state["lift-9-2"] && this.movement.getElevator()) {
					this.state["lift-9-2"] = true;
					this.movement.main.benson.addMessage("Take the lift down.");
					this.movement.main.benson.addMessage("This complex houses all");
					this.movement.main.benson.addMessage("that we know about the");
					this.movement.main.benson.addMessage("current situation.");
					this.movement.main.benson.addMessage("[E] to use the lift.");
				}
				if (!this.state["in-lift-9-2"] && this.movement.usingElevator()) {
					this.state["in-lift-9-2"] = true;
					this.movement.main.benson.addMessage("You're welcome to take");
					this.movement.main.benson.addMessage("all you find with you.");
					this.movement.main.benson.addMessage("[P] to pick things up.");
				}
			}
		};
	}

	update(sectorX, sectorY) {
		let key = "" + sectorX + "," + sectorY;
		if (this.EVENTS[key]) this.EVENTS[key]();
	}
}