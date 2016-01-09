import $ from 'jquery';

const COMP_SCALE = 3.0;

export class Compass {
	constructor(w, h) {
		this.w = w;
		this.h = h;
		this.el = $("#comp_canvas");
		
		// sizing via css will make the canvas blurry :-(
		this.el.attr({
			width: 540 * COMP_SCALE,
			height: this.h
		});
		var ctx = this.el[0].getContext('2d');
		ctx.fillStyle = "#ffffff";
		ctx.font = "8px sans-serif";
		for(let a = -90; a < 360 + 90; a++) {

			let angle = a % 360;
			if(angle < 0) angle += 360;

			let x = a + 90;

			if(angle % 10 == 0) {
				ctx.fillRect(x * COMP_SCALE, 0, COMP_SCALE, this.h * .75);
				ctx.fillText("" + angle, (x - 7) * COMP_SCALE, this.h * .5 + 10);
			} else if(angle % 5 == 0) {
				ctx.fillRect(x * COMP_SCALE, 0, COMP_SCALE, this.h * .5);
			}
		}
	}

	update(angle) {
		this.el.css("margin-left", "-" + ((360 - angle) * COMP_SCALE) + "px");
	}
}

export class Horizon {
	constructor(w, h) {
		this.w = w;
		this.h = h;
		this.el = $("#el_canvas");

		// sizing via css will make the canvas blurry :-(
		this.el.attr({
			width: this.w,
			height: 540 * COMP_SCALE
		});
		var ctx = this.el[0].getContext('2d');
		ctx.fillStyle = "#ffffff";
		ctx.font = "8px sans-serif";
		for(let a = -270; a < 270; a++) {

			let angle = a % 360;

			let y = a + 270;

			if(angle % 10 == 0) {
				ctx.fillRect(0, y * COMP_SCALE, this.w * .75, COMP_SCALE);
				ctx.fillText("" + angle, this.w * .5 + 10, (y - 4) * COMP_SCALE);
			} else if(angle % 5 == 0) {
				ctx.fillRect(0, y * COMP_SCALE, this.w * .5, COMP_SCALE);
			}
		}
	}

	update(angle) {
		var a = angle + 270;
		this.el.css("margin-top", "-" + (a * COMP_SCALE - this.h * .5 - 5 * COMP_SCALE) + "px");
	}
}
