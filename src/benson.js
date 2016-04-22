import $ from 'jquery'
import * as noise from 'noise'
import * as messages from 'messages'

const SPEED_MULT = 2;
const PAUSE_DELAY = 1500;

export class Benson {
	constructor(context={}) {
		this.el = $("#message .value");
		this.scroll = 1;
		this.el.css("left", this.scroll * 100 + "%");
		this.messages = [];
		this.prevTime = Date.now();
		this.pause = null;
		this.out = false;
		this.noise = new noise.Noise();
		this.context = context;
		this.history = [];
		this.replayMode = false;
	}

	showMessage(messageIndex, addBreak=true, onComplete=null) {
		if(addBreak) this.addLogBreak();

		this.history.push(messageIndex);
		let lines = messages.VALUES[messageIndex].split("|");
		for(let lc = 0; lc < lines.length; lc++) {
			let words = lines[lc].split(" ");
			let line = "";
			for (let i = 0; i < words.length; i++) {
				let next = (i == 0 ? "" : " ") + words[i];
				let forLength = next.replace(/\*/g, "");
				if (line.length + forLength.length >= 27) {
					this.addMessage(line);
					line = words[i];
				} else {
					line += next;
				}
			}
			this.addMessage(line, lc == lines.length - 1 ? onComplete : null);
		}
	}

	_showMessage(message) {
		if($("#log_display .active").length > 0) {
			$("#log_display .active").append(" <span class='log_message'>" + message + "</span>");
		} else {
			let div = "<div class='message active'>" +
				"<span class='log_marker'>" + (this.replayMode ? "" : window.merc.getLogMarker()) + "</span>" +
				"<span class='log_message'>" + message + "</span>" +
				"</div>";
			$("#log_display .log_break").eq(0).before(div);
		}

		if(!this.replayMode) this.el.empty().append(message);
	}

	addLogBreak() {
		this.history.push(-1);
		$("#log_display").prepend("<div class='log_break'></div>");
		$("#log_display .message").removeClass("active");
	}

	addMessage(message, onComplete) {
		message = message.replace(/\*(.*?)\*/g, "<span class='log_important'>$1</span>");
		if(this.replayMode) {
			this._showMessage(message);
		} else {
			// skip dupes
			if (this.messages.length > 0 && this.messages[this.messages.length - 1][0] == message) {
				return;
			}

			this.messages.push([message, onComplete]);
			if (this.messages.length == 1) {
				this._showMessage(this.messages[0][0]);
			}
		}
	}

	replay(history) {
		this.replayMode = true;
		for(let index of history) {
			if(index < 0) {
				this.addLogBreak()
			} else {
				this.showMessage(index, false);
			}
		}
		this.replayMode = false;
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
						this._showMessage(this.messages[0][0]);
					}
				}
			} else {
				this.el.css("left", this.scroll * 100 + "%");
				this.scroll -= delta * SPEED_MULT;
				if(this.scroll > .9) {
					this.noise.setLevel("benson", 1);
				} else if(this.scroll > .8) {
					this.noise.setLevel("benson", .5);
				} else if(this.scroll > .7) {
					this.noise.setLevel("benson", 1);
				} else {
					this.noise.stop("benson");
				}
				if (this.scroll <= 0) {
					this.scroll = 0;
					this.el.css("left", "0");
					this.pause = time;
				}
			}
		}
	}
}