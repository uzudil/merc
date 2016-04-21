import * as util from 'util'
import * as constants from 'constants'
import * as messages from 'messages'

const X_FILES = [
	messages.MESSAGES.x_file_1,
	messages.MESSAGES.x_file_2,
	messages.MESSAGES.x_file_3,
	messages.MESSAGES.x_file_4
];

const XENO_FILES = [
	messages.MESSAGES.xeno_1,
	messages.MESSAGES.xeno_2,
	messages.MESSAGES.xeno_3,
	messages.MESSAGES.xeno_4
];

export class Events {
	static getStartState() {
		return {
			"allitus-ttl": 10,
			"next-game-day": Date.now() + constants.GAME_DAY * 0.65,
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
					this.movement.main.benson.showMessage(messages.MESSAGES.lift_9_2);
				}
				if (!this.state["in-lift-9-2"] && this.movement.usingElevator()) {
					this.state["in-lift-9-2"] = true;
					this.movement.main.benson.showMessage(messages.MESSAGES.in_lift_9_2);
				}
			}
		};
		this.PICKUP_EVENTS = {
			"09,02,CCCCFF": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_1_9_2);
				return true;
			},
			"09,02,CCCCCC": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_2_9_2);
				return true;
			},
			"09,02,FFCC88": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_3_9_2);
				this.state["lightcar-keys"] = true;
				return true;
			},
			"c8,f0,CCFFFF": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.term_100);
				if(this.state["override-17a"]) {
					this.movement.main.benson.showMessage(messages.MESSAGES.override, false);
					this.movement.main.benson.showMessage(messages.MESSAGES.term_100_or, false);
				} else {
					this.movement.main.benson.showMessage(messages.MESSAGES.ok_message, false);
				}
				return true;
			},
			"c8,f0,FFCCFF": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.term_110);
				if(this.state["override-17a"]) {
					this.movement.main.benson.showMessage(messages.MESSAGES.override, false);
					this.movement.main.benson.showMessage(messages.MESSAGES.term_110_or, false);
				} else {
					this.movement.main.benson.showMessage(messages.MESSAGES.ok_message, false);
				}
				return true;
			},
			"c8,f0,FFCC88": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.term_120);
				if(this.state["override-17a"]) {
					this.movement.main.benson.showMessage(messages.MESSAGES.override, false);
					this.movement.main.benson.showMessage(messages.MESSAGES.term_120_or, false);
				} else {
					this.movement.main.benson.showMessage(messages.MESSAGES.ok_message, false);
				}
				return true;
			},
			"c8,f0,FFCCCC": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_c8_f0);
				return true;
			},
			"c8,f0,FF8866": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.override_disk);
				this.state["override-17a"] = true;
				return false;
			},
			"36,c9,CCCCFF": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.term_20a);
				return this.xFileTerm();
			},
			"36,c9,FFCC88": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.term_20b);
				return this.xFileTerm();
			},
			"36,c9,FFCCCC": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_1_36_c9);
				return true;
			},
			"36,c9,FFCCFF": ()=> {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_2_36_c9);
				return true;
			},
			"36,c9,CCCCCC": () => {
				this.movement.main.benson.showMessage(messages.MESSAGES.info_3_36_c9);
				return true;
			},
			"36,c9,FF8866": () => {
				this.movement.main.benson.showMessage(messages.MESSAGES.allitus_1);
				if(this.state["allitus_control"]) {
					this.movement.main.benson.showMessage(messages.MESSAGES.allitus_on, false);
				} else {
					this.movement.main.benson.showMessage(messages.MESSAGES.allitus_off, false);
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
					this.movement.main.benson.showMessage(messages.MESSAGES.drives_with_core);
					this.state["xeno_base_depart"] = true;
				} else {
					this.movement.main.benson.showMessage(messages.MESSAGES.drives_no_core);
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
					if(this.state["allitus_control"]) {
						this.movement.main.benson.showMessage(messages.MESSAGES.allitus_armed);
					} else {
						this.movement.main.benson.showMessage(messages.MESSAGES.allitus_disarmed);
						this.movement.main.benson.showMessage(messages.MESSAGES.thanks, false);
					}
				}, 500);
				return true;
			}
		}
	}

	xFileTerm() {
		if(this.state["override-17a"]) {
			this.movement.main.benson.showMessage(X_FILES[this.xFileIndex], false);
			this.xFileIndex++;
			if (this.xFileIndex >= X_FILES.length) this.xFileIndex = 0;
		} else {
			this.movement.main.benson.showMessage(messages.MESSAGES.ok_message, false);
		}
		return true;
	}

	xenoTerm() {
		if(this.movement.inInventory("trans")) {
			this.movement.main.benson.showMessage(XENO_FILES[this.xenoFileIndex]);
			this.xenoFileIndex++;
			if (this.xenoFileIndex >= XENO_FILES.length) this.xenoFileIndex = 0;
		} else {
			this.movement.main.benson.showMessage(messages.MESSAGES.xeno_gibberish);
		}
		return true;
	}

	update(sectorX, sectorY, now) {
		let key = "" + util.toHex(sectorX,2) + "," + util.toHex(sectorY,2);
		if (this.EVENTS[key]) this.EVENTS[key]();

		if(now > this.state["next-game-day"]) {
			this.state["allitus-ttl"] -= 1;
			this.state["next-game-day"] = now + constants.GAME_DAY;
		}
		this.hourOfDay = 24 - (this.state["next-game-day"] - now)/constants.GAME_DAY * 24;
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
		if(pos.z >= 10000 && vehicle && vehicle.model.name == "ufo" &&
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
		return this.state["allitus_control"] ? this.state["allitus-ttl"] : 10;
	}
}
