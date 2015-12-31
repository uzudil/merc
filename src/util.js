export function bind(callerObj, method) {
	return function() {
		return method.apply(callerObj, arguments);
	};
}

export function rad2angle(rad) {
	return (rad / Math.PI) * 180.0;
}

/**
 * credit: https://github.com/zacharydenton/noise.js
 */
export class PinkNoise {
	constructor() {
		this.audioContext = new AudioContext();
		var bufferSize = 4096;
		this.pinkNoise = (() => {
			var b0, b1, b2, b3, b4, b5, b6;
			b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
			var node = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
			node.onaudioprocess = (e) => {
				var output = e.outputBuffer.getChannelData(0);
				for (var i = 0; i < bufferSize; i++) {
					var white = Math.random() * 2 - 1;
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
		this.pinkGain = this.audioContext.createGain();
		this.pinkFilter = this.audioContext.createBiquadFilter();
		this.pinkGain.gain.value = 10;
		this.pinkFilter.frequency.value = 440.0;
		this.pinkNoise.connect(this.pinkFilter);
		this.pinkFilter.connect(this.pinkGain);
	}

	start() {
		this.pinkGain.connect(this.audioContext.destination);
	}

	stop() {
		this.pinkGain.disconnect();
	}

	setGain(gain) {
		this.pinkGain.gain.value = gain;
	}

	setFreq(freq) {
		this.pinkFilter.frequency.value = freq;
	}
}
