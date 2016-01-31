import $ from 'jquery'

const SPEED_MULT = 1;
const PAUSE_DELAY = 1500;

export class Benson {
	constructor() {
		this.el = $("#message .value");
		this.scroll = 1;
		this.el.css("left", this.scroll * 100 + "%");
		this.messages = [];
		this.prevTime = Date.now();
		this.pause = null;
		this.out = false;
	}

	addMessage(message, onComplete) {
		this.messages.push([message, onComplete]);
		if(this.messages.length == 1) {
			this.el.empty().append(this.messages[0][0]);
		}
	}

	update() {
		var time = Date.now();
		var delta = ( time - this.prevTime ) / 1000;
		this.prevTime = time;
		if(this.messages.length > 0) {
			if(this.pause) {
				if (time - this.pause > PAUSE_DELAY) {
					if(this.messages[0][1]) this.messages[0][1]();
					this.pause = null;
				}
			} else if(this.scroll <= 0) {
				if(this.messages.length > 1) {
					this.el.css("left", this.scroll * 100 + "%");
					this.scroll -= delta * SPEED_MULT;
					if (this.scroll <= -1) {
						this.scroll = 1;
						this.el.css("left", this.scroll * 100 + "%");

						this.messages.splice(0, 1);
						this.el.empty();
						this.el.append(this.messages[0][0]);
					}
				}
			} else {
				this.el.css("left", this.scroll * 100 + "%");
				this.scroll -= delta * SPEED_MULT;
				if (this.scroll <= 0) {
					this.scroll = 0;
					this.pause = time;
				}
			}
		}
	}
}