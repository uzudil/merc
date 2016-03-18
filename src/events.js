import * as util from 'util'

const X_FILES = [
	[
		"File X-100: Xeno info",
		"The construct Allitus",
		"is set to destroy Targ.",
		"It was created by an",
		"alien race in order to",
		"ensure humanity doesn't",
		"evolve to discover the",
		"Xeno central base."
	],
	[
		"File X-110: Xeno info",
		"The alien artifact",
		"in this research lab, has",
		"an unknown purpose. It is",
		"thought to be related to",
		"the object at 79-66."
	],
	[
		"File X-120: Xeno info",
		"The location of the Xeno",
		"central base is debated.",
		"It may be shielded from our",
		"scanning equipment somehow."
	],
	[
		"File X-130: Xeno info",
		"Allitus cannot be",
		"disarmed at this location.",
		"However, we think the",
		"Xeno central base contains",
		"a shutoff mechanism."
	]
];

const XENO_FILES = [
	[
		"30-72: main drive failure",
		"A3 craft ejected and",
		"assumed lost. Shields",
		"and Allitus deployed.",
		"We have not been detected",
		"so far."
	],
	[
		"Targ natives have been",
		"observed evolving to",
		"within grasp of hyperlight",
		"technology. To avoid their",
		"expansion further,",
		"Allitus has been deployed."
	],
	[
		"It pains us to end their",
		"civilization on this ",
		"planet. But it is needed",
		"in order to protect",
		"ourselves from detection."
	],
	[
		"Allitus override controls",
		"are located on this base.",
		"The terminal energy",
		"released by the device",
		"should propel us into",
		"orbit again."
	]
];

const GAME_DAY = 15 * 60 * 1000; // 15 mins = 1 game day
//const GAME_DAY = 15 * 1000; // 15 mins = 1 game day

export class Events {
	static getStartState() {
		return {
			"allitus-ttl": 10,
			"next-game-day": Date.now() + GAME_DAY * 0.65,
			"allitus_control": true,
			"xeno_base_depart": false
		};
	}

	constructor(movement) {
		this.xFileIndex = 0;
		this.xenoFileIndex = 0;
		this.movement = movement;
		this.hourOfDay = 0;
		this.state = Events.getStartState();
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
					this.okReport();
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
					this.okReport();
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
					this.okReport();
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
			},
			"36,c9,CCCCFF": ()=> {
				this.movement.main.benson.addMessage("Terminal 20A: report");
				return this.xFileTerm();
			},
			"36,c9,FFCC88": ()=> {
				this.movement.main.benson.addMessage("Terminal 20B: report");
				return this.xFileTerm();
			},
			"36,c9,FFCCCC": ()=> {
				this.movement.main.benson.addMessage("This area houses");
				this.movement.main.benson.addMessage("a Xeno artifact.");
				this.movement.main.benson.addMessage("Please observe posted");
				this.movement.main.benson.addMessage("health and safety");
				this.movement.main.benson.addMessage("regulations.");
				return true;
			},
			"36,c9,FFCCFF": ()=> {
				this.movement.main.benson.addMessage("This area houses");
				this.movement.main.benson.addMessage("a Xeno artifact.");
				this.movement.main.benson.addMessage("Please observe posted");
				this.movement.main.benson.addMessage("health and safety");
				this.movement.main.benson.addMessage("regulations.");
				return true;
			},
			"36,c9,CCCCCC": () => {
				this.movement.main.benson.addMessage("Allitus: a device");
				this.movement.main.benson.addMessage("of alien origins.");
				this.movement.main.benson.addMessage("Warning: High Voltage");
				this.movement.main.benson.addMessage("Ionizing radiation");
				this.movement.main.benson.addMessage("Posted biohazard");
				this.movement.main.benson.addMessage("Do not enter.");
				return true;
			},
			"36,c9,FF8866": () => {
				this.movement.main.benson.addMessage("Feels cool to the touch.");
				if(this.state["allitus_control"]) {
					this.movement.main.benson.addMessage("An ominous buzzing");
					this.movement.main.benson.addMessage("sound is emitted.");
				} else {
					this.movement.main.benson.addMessage("Total silence reigns.");
				}
				return true;
			},
			"f8,c9,CCFFFF": () => {
				this.xenoTerm();
				return true;
			},
			"f8,c9,FF8866": () => {
				this.xenoTerm();
				return true;
			},
			"f8,c9,CCCCCC": () => {
				if(this.movement.inInventory("core")) {
					this.movement.main.benson.addMessage("The drives now have");
					this.movement.main.benson.addMessage("plasma cores installed.");
					this.movement.main.benson.addMessage("The xeno ship prepares");
					this.movement.main.benson.addMessage("to depart from Targ.");
					this.state["xeno_base_depart"] = true;
				} else {
					this.movement.main.benson.addMessage("These xeno drives need");
					this.movement.main.benson.addMessage("new plasma cores to");
					this.movement.main.benson.addMessage("operate again.");
				}
				return true;
			},
			"f8,c9,FFCCCC": (object) => {
				this.state["allitus_control"] = !this.state["allitus_control"];
				if(this.state["allitus_control"]) {
					util.toggleColor(object, 0x02C40C, 0xC4000C);
				} else {
					util.toggleColor(object, 0xC4000C, 0x02C40C);
					util.toggleColor(object, 0xc5020d, 0x02C40C); // I... no idea why
				}
				this.movement.noise.play("control");
				setTimeout(()=> {
					this.movement.main.benson.addMessage("Allitus is " + (this.state["allitus_control"] ? "ARMED" : "disarmed"));
					if(!this.state["allitus_control"]) {
						this.movement.main.benson.addMessage("The Targ city council is");
						this.movement.main.benson.addMessage("eternally grateful for");
						this.movement.main.benson.addMessage("disabling the alien threat.");
						this.movement.main.benson.addMessage("20000 credits have been");
						this.movement.main.benson.addMessage("added to your account.");
					}
				}, 500);
				return true;
			}
		}
	}

	xFileTerm() {
		if(this.state["override-17a"]) {
			for (let line of X_FILES[this.xFileIndex]) {
				this.movement.main.benson.addMessage(line);
			}
			this.xFileIndex++;
			if (this.xFileIndex >= X_FILES.length) this.xFileIndex = 0;
		} else {
			this.okReport();
		}
		return true;
	}

	xenoTerm() {
		if(this.movement.inInventory("trans")) {
			for (let line of XENO_FILES[this.xenoFileIndex]) {
				this.movement.main.benson.addMessage(line);
			}
			this.xenoFileIndex++;
			if (this.xenoFileIndex >= XENO_FILES.length) this.xenoFileIndex = 0;
		} else {
			this.movement.main.benson.addMessage("Xargff norgil Mggarth.");
		}
		return true;
	}

	okReport() {
		this.movement.main.benson.addMessage("Memory scan: OK");
		this.movement.main.benson.addMessage("Disk scan: OK");
		this.movement.main.benson.addMessage("System health: OK");
	}

	update(sectorX, sectorY, now) {
		let key = "" + util.toHex(sectorX,2) + "," + util.toHex(sectorY,2);
		if (this.EVENTS[key]) this.EVENTS[key]();

		if(now > this.state["next-game-day"]) {
			this.state["allitus-ttl"] -= 1;
			this.state["next-game-day"] = now + GAME_DAY;
		}
		this.hourOfDay = 24 - ((this.state["next-game-day"] - now)/GAME_DAY * 24)|0;
	}

	pickup(modelName, sectorX, sectorY, roomColor, object) {
		let key = "" + util.toHex(sectorX,2) + "," + util.toHex(sectorY,2) + "," + roomColor;
		console.log("key=" + key);
		if (this.PICKUP_EVENTS[key]) {
			return this.PICKUP_EVENTS[key](object);
		}
		return false;
	}

	checkPosition(pos, vehicle) {
		// "sonar" to alien base
		let now = Date.now();
		if(pos.z >= 10000 && vehicle.model.name == "ufo" &&
			!this.state["xeno_base_depart"] &&
			(!this.state["xeno-base-notification"] || now > this.state["xeno-base-notification"])) {
			let d = Math.min(1, this.movement.getDistanceToAlienBase() / 0xff);
			// stop beeping when really close
			if(d > 0.01) {
				this.movement.noise.play("base", 1 - d);
			}
			this.state["xeno-base-notification"] = now + Math.max(500, (5000 * d)|0);
		}
	}

	getAllitusTTL() {
		return this.state["allitus-ttl"];
	}
}
