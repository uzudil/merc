import * as util from 'util'

export class Events {
	constructor(movement) {
		this.movement = movement;
		this.state = {
			"allitus-ttl": 10
		};
		this.EVENTS = {
			"09,02": ()=> {
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
			"09,02,CCCCFF": ()=> {
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
				return true;
			},
			"09,02,CCCCCC": ()=> {
				this.movement.main.benson.addMessage("Since your last visit,");
				this.movement.main.benson.addMessage("Alien ruins have been");
				this.movement.main.benson.addMessage("discovered on Targ.");
				this.movement.main.benson.addMessage("An underground complex");
				this.movement.main.benson.addMessage("and cave system is");
				this.movement.main.benson.addMessage("located at d9-42.");
				return true;
			},
			"09,02,FFCC88": ()=> {
				this.movement.main.benson.addMessage("We have requisitioned");
				this.movement.main.benson.addMessage("a Lightcar for your");
				this.movement.main.benson.addMessage("travels. It has now been");
				this.movement.main.benson.addMessage("encoded for your use.");
				this.state["lightcar-keys"] = true;
				return true;
			},
			"c8,f0,CCFFFF": ()=> {
				this.movement.main.benson.addMessage("Terminal 100: report");
				if(this.state["override-17a"]) {
					this.movement.main.benson.addMessage("Override 17A exec:");
					this.movement.main.benson.addMessage("!System compromised!");
					this.movement.main.benson.addMessage("The intruder Allitus is");
					this.movement.main.benson.addMessage("taking over all Targ");
					this.movement.main.benson.addMessage("communications.");
				} else {
					this.movement.main.benson.addMessage("Memory scan: OK");
					this.movement.main.benson.addMessage("Disk scan: OK");
					this.movement.main.benson.addMessage("System health: OK");
				}
				return true;
			},
			"c8,f0,FFCCFF": ()=> {
				this.movement.main.benson.addMessage("Terminal 110: report");
				if(this.state["override-17a"]) {
					this.movement.main.benson.addMessage("Override 17A exec:");
					this.movement.main.benson.addMessage("!System compromised!");
					this.movement.main.benson.addMessage("Allitus has no known");
					this.movement.main.benson.addMessage("weakness. To learn more");
					this.movement.main.benson.addMessage("visit our Xeno studies");
					this.movement.main.benson.addMessage("lab at 36-c9.");
				} else {
					this.movement.main.benson.addMessage("Memory scan: OK");
					this.movement.main.benson.addMessage("Disk scan: OK");
					this.movement.main.benson.addMessage("System health: OK");
				}
				return true;
			},
			"c8,f0,CCFFCC": ()=> {
				this.movement.main.benson.addMessage("Terminal 120: report");
				if(this.state["override-17a"]) {
					this.movement.main.benson.addMessage("Override 17A exec:");
					this.movement.main.benson.addMessage("!System compromised!");
					this.movement.main.benson.addMessage("Allitus is now armed.");
					this.movement.main.benson.addMessage("It is set to go critical");
					this.movement.main.benson.addMessage("in " + this.state["allitus-ttl"] + " days.");
				} else {
					this.movement.main.benson.addMessage("Memory scan: OK");
					this.movement.main.benson.addMessage("Disk scan: OK");
					this.movement.main.benson.addMessage("System health: OK");
				}
				return true;
			},
			"c8,f0,FFCCCC": ()=> {
				this.movement.main.benson.addMessage("Defense Council Info:");
				this.movement.main.benson.addMessage("You're welcome to use");
				this.movement.main.benson.addMessage("the Defense Computer Array,");
				this.movement.main.benson.addMessage("via the terminals. Your");
				this.movement.main.benson.addMessage("security clearance will");
				this.movement.main.benson.addMessage("decide the info you see.");
				return true;
			},
			"c8,f0,FF8866": ()=> {
				this.movement.main.benson.addMessage("You find a disk labeled");
				this.movement.main.benson.addMessage("Emergency Override 17A");
				this.movement.main.benson.addMessage("It looks like it fits");
				this.movement.main.benson.addMessage("some kind of terminal.");
				this.state["override-17a"] = true;
				return false;
			}
		}
	}

	update(sectorX, sectorY) {
		let key = "" + util.toHex(sectorX,2) + "," + util.toHex(sectorY,2);
		if (this.EVENTS[key]) this.EVENTS[key]();
	}

	pickup(modelName, sectorX, sectorY, roomColor) {
		let key = "" + util.toHex(sectorX,2) + "," + util.toHex(sectorY,2) + "," + roomColor;
		console.log("key=" + key);
		if (this.PICKUP_EVENTS[key]) {
			return this.PICKUP_EVENTS[key]();
		}
		return false;
	}
}