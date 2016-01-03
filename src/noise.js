import * as util from 'util'

/**
 * credit: https://github.com/zacharydenton/noise.js
 */
export class Noise {
	constructor(audioContext) {
		this.audioContext = audioContext;
		this.initNoises();

		this.setMode("jet");
	}

	start() {
		if(this.component) this.component.getComponent().connect(this.audioContext.destination);
	}

	stop() {
		if(this.component) this.component.getComponent().disconnect();
	}

	setLevel(level) {
		this.component.setLevel(level);
	}

	setMode(mode) {
		this.stop();
		this.mode = mode;
		this.component = this.noises[this.mode];
		console.log("Setting mode to " + this.mode + " comp=", this.component);
	}

	initNoises() {
		this.noises = {
			jet: new JetNoise(this),
			car: new CarNoise(this),
			pink: new PinkNoise(this),
			walk: new WalkNoise(this)
		};
	}

	createNoiseBuffer(amps=1, offset=0) {
		var noiseBuffer = this.audioContext.createBuffer(2, 0.5 * this.audioContext.sampleRate, this.audioContext.sampleRate);
		var left = noiseBuffer.getChannelData(0);
		var right = noiseBuffer.getChannelData(1);
		for (var i = 0; i < noiseBuffer.length; i++) {
			left[i] = Math.random() * (amps * 2) - amps + offset;
			right[i] = Math.random() * (amps * 2) - amps + offset;
		}
		return noiseBuffer;
	}

	createGapNoiseBuffer(on_time=100, off_time=100, amps=1, offset=0) {
		var noiseBuffer = this.audioContext.createBuffer(2, 0.5 * this.audioContext.sampleRate, this.audioContext.sampleRate);
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
}

class PinkNoise {

	constructor(noise) {
		var bufferSize = 4096;
		var pinkNoise = (() => {
			var b0, b1, b2, b3, b4, b5, b6;
			b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
			var node = noise.audioContext.createScriptProcessor(bufferSize, 1, 1);
			node.onaudioprocess = (e) => {
				var output = e.outputBuffer.getChannelData(0);
				for (var i = 0; i < bufferSize; i++) {
					let white = Math.random() * 2 - 1;
					b0 = 0.99886 * b0 + white * 0.0555179;
					b1 = 0.99332 * b1 + white * 0.0750759;
					b2 = 0.96900 * b2 + white * 0.1538520;
					b3 = 0.86650 * b3 + white * 0.3104856;
					b4 = 0.55000 * b4 + white * 0.5329522;
					b5 = -0.7616 * b5 - white * 0.0168980;
					output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
					output[i] *= 0.11; // (roughly) compensate for gain
					b6 = white * 0.115926;
				}
			};
			return node;
		})();

		this.gain = noise.audioContext.createGain();
		this.filter = noise.audioContext.createBiquadFilter();
		this.gain.gain.value = 10;
		this.filter.frequency.value = 440.0;

		pinkNoise.connect(this.filter);
		this.filter.connect(this.gain);
	}

	getComponent() {
		return this.gain;
	}

	setLevel(level) {
		this.filter.frequency.value = 100.0 + 150.0 * level;
		this.gain.gain.value = 3 + level * 9;
	}
}

class JetNoise {
	constructor(noise) {
		this.whiteNoise = noise.audioContext.createBufferSource();
		this.whiteNoise.buffer = noise.createNoiseBuffer();
		this.whiteNoise.loop = true;
		this.whiteNoise.start(0);

		this.filter = noise.audioContext.createBiquadFilter();
		this.filter.frequency.value = 440.0;

		this.whiteNoise.connect(this.filter);
	}

	getComponent() {
		return this.filter;
	}

	setLevel(level) {
		var x = Math.sin(0.5 * Math.PI * level);
		this.filter.frequency.value = x * 400.0 + 600.0;
		this.whiteNoise.playbackRate.value = x * 0.01 + 0.025;
	}
}

class CarNoise {
	constructor(noise) {

		this.source = noise.audioContext.createBufferSource();
		this.source.buffer = noise.createGapNoiseBuffer();
		this.source.loop = true;
		this.source.start();

		this.filter = noise.audioContext.createBiquadFilter();
		this.filter.frequency.value = 800.0;

		this.gain = noise.audioContext.createGain();
		this.gain.gain.value = 1;

		this.source.connect(this.filter);
		this.filter.connect(this.gain);
	}

	getComponent() {
		return this.gain;
	}

	setLevel(level) {
		var x = Math.sin(0.5 * Math.PI * level);
		this.filter.frequency.value = 100.0 * x + 300;
		this.source.playbackRate.value = x * 0.01 + 0.25;
		//this.gain.gain.value = 3 + level * 9;
	}
}

class WalkNoise {
	constructor(noise) {

		this.source = noise.audioContext.createBufferSource();
		this.source.buffer = noise.createGapNoiseBuffer(100, 750);
		this.source.loop = true;
		this.source.start();

		this.filter = noise.audioContext.createBiquadFilter();
		this.filter.frequency.value = 800.0;

		this.gain = noise.audioContext.createGain();
		this.gain.gain.value = 3;

		this.source.connect(this.filter);
		this.filter.connect(this.gain);
	}

	getComponent() {
		return this.gain;
	}

	setLevel(level) {
		var x = Math.sin(0.5 * Math.PI * level);
		this.filter.frequency.value = 100;
		this.source.playbackRate.value = 0.05;
		//this.gain.gain.value = 3 + level * 9;
	}
}

