import * as util from 'util'

/**
 * credit: https://github.com/zacharydenton/noise.js
 */
export var SOUND_ENABLED = true;

export class Noise {
	constructor() {
		this.noises = {
			jet: new JetNoise(),
			car: new CarNoise(),
			pink: new PinkNoise(),
			walk: new WalkNoise(),
			lift: new LiftNoise(),
			door: new DoorNoise(),
			benson: new BensonNoise(),
			ufo: new UfoNoise(),
			teleport: new TeleportNoise()
		};
		this.sounds = {
			denied: new DeniedSound(),
			base: new AlienBaseSound()
		}
	}

	static toggleSound() {
		SOUND_ENABLED = !SOUND_ENABLED;
	}

	stop(name) {
		this.noises[name].stop();
	}

	setLevel(name, level) {
		if(SOUND_ENABLED) this.noises[name].setLevel(level);
	}

	play(name, level) {
		this.sounds[name].play(level);
	}
}

var globalContext = new AudioContext();

function createNoiseBuffer(audioContext, amps=1, offset=0) {
	var noiseBuffer = audioContext.createBuffer(2, 0.5 * audioContext.sampleRate, audioContext.sampleRate);
	var left = noiseBuffer.getChannelData(0);
	var right = noiseBuffer.getChannelData(1);
	for (var i = 0; i < noiseBuffer.length; i++) {
		left[i] = Math.random() * (amps * 2) - amps + offset;
		right[i] = Math.random() * (amps * 2) - amps + offset;
	}
	return noiseBuffer;
}

function createGapNoiseBuffer(audioContext, on_time=100, off_time=100, amps=1, offset=0) {
	var noiseBuffer = audioContext.createBuffer(2, 0.5 * audioContext.sampleRate, audioContext.sampleRate);
	var left = noiseBuffer.getChannelData(0);
	var right = noiseBuffer.getChannelData(1);
	var on = true;
	for (var i = 0; i < noiseBuffer.length; i++) {
		if(on) {
			left[i] = Math.random() * (amps * 2) - amps + offset;
			right[i] = Math.random() * (amps * 2) - amps + offset;
			if(i % on_time == 0) {
				on = false;
			}
		} else {
			left[i] = right[i] = 0;
			if(i % off_time == 0) {
				on = true;
			}
		}
	}
	return noiseBuffer;
}

function createPinkNoiseBuffer(audioContext, amps=1, offset=0) {
	var noiseBuffer = audioContext.createBuffer(5, 0.5 * audioContext.sampleRate, audioContext.sampleRate);
	var left = noiseBuffer.getChannelData(0);
	var right = noiseBuffer.getChannelData(1);
	let p1 = pinkNoiseStep();
	let p2 = pinkNoiseStep();
	for (var i = 0; i < noiseBuffer.length; i++) {
		p1(left, i);
		p2(right, i);
	}
	return noiseBuffer;
}

function pinkNoiseStep() {
	var b0, b1, b2, b3, b4, b5, b6;
	b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
	return (output, index) => {
		let white = Math.random() * 2 - 1;
		b0 = 0.99886 * b0 + white * 0.0555179;
		b1 = 0.99332 * b1 + white * 0.0750759;
		b2 = 0.96900 * b2 + white * 0.1538520;
		b3 = 0.86650 * b3 + white * 0.3104856;
		b4 = 0.55000 * b4 + white * 0.5329522;
		b5 = -0.7616 * b5 - white * 0.0168980;
		output[index] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
		output[index] *= 0.11; // (roughly) compensate for gain
		b6 = white * 0.115926;
	}
}

class DeniedSound {
	constructor() {
		this.playing = false;
	}

	play(level) {
		if(this.playing) return;
		this.playing = true;

		let voice1 = new Voice(globalContext, 0.2, 300);
		let voice2 = new Voice(globalContext, 0.2, 340);
		voice1.start();
		voice2.start();
		setTimeout(() => {
			voice1.stop();
			voice2.stop();
			voice1 = new Voice(globalContext, 0.2, 220);
			voice2 = new Voice(globalContext, 0.2, 260);
			voice1.start();
			voice2.start();
			setTimeout(() => {
				voice1.stop();
				voice2.stop();
				this.playing = false;
			}, 100);
		}, 150);
	}
}

class AlienBaseSound {
	constructor() {
		this.playing = false;
	}

	play(level) {
		if(this.playing) return;
		this.playing = true;

		let voice1 = new Voice(globalContext, 0.2, 300 + level * 250);
		let voice2 = new Voice(globalContext, 0.2, 320 + level * 250);
		let voice3 = new Voice(globalContext, 0.2, 340 + level * 250);
		voice1.start();
		voice2.start();
		voice3.start();
		setTimeout(() => {
			voice1.stop();
			voice2.stop();
			voice3.stop();
			this.playing = false;
		}, 150);
	}
}

class PinkNoise {

	constructor() {
		this.started = false;
		this.audioContext = globalContext;

		this.distortion = this.audioContext.createBufferSource();
		this.distortion.buffer = createPinkNoiseBuffer(this.audioContext);
		this.distortion.start(0);
		this.distortion.loop = true;

		this.gain = this.audioContext.createGain();
		this.filter = this.audioContext.createBiquadFilter();
		this.gain.gain.value = 10;
		this.filter.frequency.value = 440.0;

		this.distortion.connect(this.filter);
		this.filter.connect(this.gain);
		//this.gain.connect(this.audioContext.destination);
	}

	start(context) {
		if(!this.started) {
			this.gain.connect(this.audioContext.destination);
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.gain.disconnect();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.filter.frequency.value = 100.0 + 150.0 * level;
		this.gain.gain.value = 3 + level * 9;
	}
}

class JetNoise {
	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.distortion = this.audioContext.createBufferSource();
		this.distortion.buffer = createNoiseBuffer(this.audioContext);
		this.distortion.loop = true;
		this.distortion.start(0);

		this.filter = this.audioContext.createBiquadFilter();
		this.filter.frequency.value = 440.0;

		this.gain = this.audioContext.createGain();

		this.gain.gain.value = 0.1;

		this.distortion.connect(this.filter);
		this.filter.connect(this.gain);
	}

	start(context) {
		if(!this.started) {
			this.gain.connect(this.audioContext.destination);
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.gain.disconnect();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		var x = Math.sin(0.5 * Math.PI * level);
		this.filter.frequency.value = x * 400.0 + 600.0;
		this.distortion.playbackRate.value = x * 0.01 + 0.025;
		this.gain.gain.value = 0.2 + x * 0.3;
	}
}

// credit: http://blog.chrislowis.co.uk/demos/polyphonic_synthesis/demo2/synth.js
class Voice {

	constructor(context, volume, frequency) {
		this.context = context;
		this.frequency = frequency;
		this.volume = volume;

		/* VCO */
		this.vco = this.context.createOscillator();
		this.vco.type = "sine";
		this.vco.frequency.value = this.frequency;
		this.vco.start(0);

		/* VCA */
		this.vca = context.createGain();

		this.vca.gain.value = this.volume;

		/* connections */
		this.vco.connect(this.vca);
	}

	setLevel(level) {
		var x = Math.sin(0.5 * Math.PI * level);
		this.vco.frequency.value = this.frequency * 0.5 + x * this.frequency * 0.5;
	}

	start() {
		this.vca.connect(this.context.destination);
	};

	stop() {
		this.vca.disconnect();
	}
}

class Distortion {
	constructor(context, volume, frequency, gapNoise) {
		this.volume = volume;
		this.context = context;
		this.frequency = frequency || 440.0;
		this.distortion = context.createBufferSource();
		this.distortion.buffer = gapNoise ? createGapNoiseBuffer(context) : createNoiseBuffer(context);
		this.distortion.loop = true;
		this.distortion.start(0);

		this.filter = context.createBiquadFilter();
		this.filter.frequency.value = this.frequency;

		this.gain = context.createGain();

		this.gain.gain.value = this.volume;

		this.distortion.connect(this.filter);
		this.filter.connect(this.gain);
	}

	setLevel(level) {
		var x = Math.sin(0.5 * Math.PI * level);
		this.gain.gain.value = (0.1 + x * 0.9) * this.volume;
	}

	start() {
		this.gain.connect(this.context.destination);
	};

	stop() {
		this.gain.disconnect();
	}
}

class LiftNoise {

	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.voice1 = new Voice(this.audioContext, 0.2, 400);
		this.voice2 = new Voice(this.audioContext, 0.2, 500);
		this.distortion = new Distortion(this.audioContext, 0.5, 440);
	}

	start(context) {
		if(!this.started) {
			this.voice1.start();
			this.voice2.start();
			this.distortion.start();
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.voice1.stop();
			this.voice2.stop();
			this.distortion.stop();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.voice1.setLevel(level);
		this.voice2.setLevel(level);
		this.distortion.setLevel(level);
	}
}

class DoorNoise {

	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.voice1 = new Voice(this.audioContext, 0.2, 700);
		this.distortion = new Distortion(this.audioContext, 0.5, 500);
	}

	start(context) {
		if(!this.started) {
			this.voice1.start();
			this.distortion.start();
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.voice1.stop();
			this.distortion.stop();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.voice1.setLevel(level);
		this.distortion.setLevel(level);
	}
}

class TeleportNoise {

	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.voice1 = new Voice(this.audioContext, 0.2, 600);
		this.voice2 = new Voice(this.audioContext, 0.2, 560);
		this.voice3 = new Voice(this.audioContext, 0.2, 520);
	}

	start(context) {
		if(!this.started) {
			this.voice1.start();
			this.voice2.start();
			this.voice3.start();
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.voice1.stop();
			this.voice2.stop();
			this.voice3.stop();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.voice1.setLevel(level);
		this.voice2.setLevel(level);
		this.voice3.setLevel(level);
	}
}

class BensonNoise {

	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.voice1 = new Voice(this.audioContext, 0.2, 440);
		this.voice2 = new Voice(this.audioContext, 0.2, 500);
		this.voice3 = new Voice(this.audioContext, 0.2, 550);
	}

	start(context) {
		if(!this.started) {
			this.voice1.start();
			this.voice2.start();
			this.voice3.start();
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.voice1.stop();
			this.voice2.stop();
			this.voice3.stop();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.voice1.setLevel(level);
		this.voice2.setLevel(level);
		this.voice3.setLevel(level);
	}
}

class CarNoise {
	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.voice1 = new Voice(this.audioContext, 0.2, 300);
		this.voice2 = new Voice(this.audioContext, 0.2, 400);
		this.distortion = new Distortion(this.audioContext, 2, 400, true);
	}

	start(context) {
		if(!this.started) {
			this.voice1.start();
			this.voice2.start();
			this.distortion.start();
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.voice1.stop();
			this.voice2.stop();
			this.distortion.stop();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.voice1.setLevel(level);
		this.voice2.setLevel(level);
		this.distortion.setLevel(level);
	}
}

class UfoNoise {
	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.voice1 = new Voice(this.audioContext, 0.2, 400);
		this.voice2 = new Voice(this.audioContext, 0.2, 440);
		this.voice3 = new Voice(this.audioContext, 0.2, 200);
		this.distortion = new Distortion(this.audioContext, 2, 500, true);
	}

	start(context) {
		if(!this.started) {
			this.voice1.start();
			this.voice2.start();
			this.voice3.start();
			this.distortion.start();
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.voice1.stop();
			this.voice2.stop();
			this.voice3.stop();
			this.distortion.stop();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		this.voice1.setLevel(level * .05);
		this.voice2.setLevel(level * .15);
		this.voice3.setLevel(level * .15);
		this.distortion.setLevel(level * .05);
	}
}

class WalkNoise {
	constructor() {
		this.started = false;
		this.audioContext = globalContext;
		this.source = this.audioContext.createBufferSource();
		this.source.buffer = createGapNoiseBuffer(this.audioContext, 100, 750);
		this.source.loop = true;
		this.source.start();

		this.filter = this.audioContext.createBiquadFilter();
		this.filter.frequency.value = 800.0;

		this.gain = this.audioContext.createGain();

		this.gain.gain.value = 3;

		this.source.connect(this.filter);
		this.filter.connect(this.gain);
	}

	start(context) {
		if(!this.started) {
			this.gain.connect(this.audioContext.destination);
			this.started = true;
		}
	}

	stop() {
		if(this.started) {
			this.gain.disconnect();
			this.started = false;
		}
	}

	setLevel(level) {
		this.start();
		var x = Math.sin(0.5 * Math.PI * level);
		this.filter.frequency.value = 100;
		this.source.playbackRate.value = 0.05;
		//this.gain.gain.value = 3 + level * 9;
	}
}

