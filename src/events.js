
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
		this.PICKUP_EVENTS = {
			"9,2,CCCCFF": ()=> {
				this.movement.main.benson.addMessage("The xeno device Allitus");
				this.movement.main.benson.addMessage("was discovered a year ago.");
				this.movement.main.benson.addMessage("At first we didn't");
				this.movement.main.benson.addMessage("understand its purpose.");
				this.movement.main.benson.addMessage("It was thought to be a");
				this.movement.main.benson.addMessage("power generator.");
				this.movement.main.benson.addMessage("Our scientists worked");
				this.movement.main.benson.addMessage("hard to fire it up.");
				this.movement.main.benson.addMessage("Some months ago they");
				this.movement.main.benson.addMessage("succeeded.");
				this.movement.main.benson.addMessage("However,");
				this.movement.main.benson.addMessage("We now know it to be");
				this.movement.main.benson.addMessage("a machine of war.");
				this.movement.main.benson.addMessage("Your task is to");
				this.movement.main.benson.addMessage("terminate Allitus.");
				this.movement.main.benson.addMessage("Next, meet with our");
				this.movement.main.benson.addMessage("defense counsil at");
				this.movement.main.benson.addMessage("coordinates c8-f0.");
			},
			"9,2,CCCCCC": ()=> {
				this.movement.main.benson.addMessage("Since your last visit,");
				this.movement.main.benson.addMessage("Alien ruins have been");
				this.movement.main.benson.addMessage("discovered on Targ.");
				this.movement.main.benson.addMessage("An underground complex");
				this.movement.main.benson.addMessage("and cave system is");
				this.movement.main.benson.addMessage("located at d9-42.");
			},
			"9,2,FFCC88": ()=> {
				this.movement.main.benson.addMessage("We have requisitioned");
				this.movement.main.benson.addMessage("a Lightcar for your");
				this.movement.main.benson.addMessage("travels. It has now");
				this.movement.main.benson.addMessage("been encoded");
				this.movement.main.benson.addMessage("for your use.");
				this.state["lightcar-keys"] = true;
			}
		}
	}

	update(sectorX, sectorY) {
		let key = "" + sectorX + "," + sectorY;
		if (this.EVENTS[key]) this.EVENTS[key]();
	}

	pickup(modelName, sectorX, sectorY, roomColor) {
		let key = "" + sectorX + "," + sectorY + "," + roomColor;
		console.log("key=" + key);
		if (this.PICKUP_EVENTS[key]) {
			this.PICKUP_EVENTS[key]();
			return true;
		}
		return false;
	}
}