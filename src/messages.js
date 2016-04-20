/*
When adding new messages, ensure their keys are sorted after any previous messages.
This is because the keys' sorted index is stored in the savegame (to conserve disk space).
Maybe prefix a new batch with zz_ or something...
 */
const messages = {
	intro_1: [
		"Set course to Novagen...",
		"Engaging Hyperdrive"
	],
	intro_2: "Enjoy your trip.",
	intro_3: [
		"Message received.",
		"Sender: Targ city.",
		"Priority: urgent."
	],
	intro_4: [
		"Request for assistance.",
		"Targ city emergency.",
		"Immediate help requested."
	],
	intro_5: "Starting deceleration...",
	intro_6: "Landing on Targ",
	welcome: [
		"Welcome to Targ.",
		"Please take the jet",
		"and proceed to <span class='log_important'>9-2</span>.",
		"<span class='log_important'>[SPACE]</span> to use the jet.",
		"<span class='log_important'>[1]</span>-<span class='log_important'>[0]</span> for power.",
		"<span class='log_important'>[SPACE]</span> to get out again."
	],
	yeehaw: "Yee-haw!",
	game_saved: "Game saved.",
	ufo_fixed: [
		"The xeno artifacts",
		"started the craft!",
		"Try take-off and turns",
		"without moving first."
	],
	ufo_broken: "This craft seems broken.",
	ship_locked: [
		"Until you complete",
		"your mission, your",
		"ship remains locked."
	],
	takeoff_1: "Preparing for takeoff...",
	takeoff_2: "3...",
	takeoff_3: "2...",
	takeoff_4: "1...",
	takeoff_5: "Blastoff!",
	"keya": "Pentagon key",
	"keyb": "Triangle key",
	"keyc": "Gate key",
	"keyd": "X key",
	"car": "Tando groundcar",
	"plane": "Harris skipjet",
	"ship": "Templar class cruiser",
	"light": "Pulsar lightcar",
	"disk": "Emergency Override Disk",
	"art": "Xeno artifact",
	"art2": "Xeno artifact",
	"ufo": "Alien craft A3",
	"trans": "Xeno translator chip",
	"core": "Plasma drive core",
	x_file_1: [
		"File X-100: Xeno info",
		"The construct Allitus",
		"is set to destroy Targ.",
		"It was created by an",
		"alien race in order to",
		"ensure humanity doesn't",
		"evolve to discover the",
		"Xeno central base."
	],
	x_file_2: [
		"File X-110: Xeno info",
		"The alien artifact",
		"in this research lab, has",
		"an unknown purpose. It is",
		"thought to be related to",
		"the object at <span class='log_important'>79-66</span>."
	],
	x_file_3: [
		"File X-120: Xeno info",
		"The location of the Xeno",
		"central base is debated.",
		"It may be shielded from our",
		"scanning equipment somehow."
	],
	x_file_4: [
		"File X-130: Xeno info",
		"Allitus cannot be",
		"disarmed at this location.",
		"However, we think the",
		"Xeno central base contains",
		"a shutoff mechanism."
	],
	xeno_1: [
		"30-72: main drive failure",
		"A3 craft ejected and",
		"assumed lost. Shields",
		"and Allitus deployed.",
		"We have not been detected",
		"so far."
	],
	xeno_2: [
		"Targ natives have been",
		"observed evolving to",
		"within grasp of hyperlight",
		"technology. To avoid their",
		"expansion further,",
		"Allitus has been deployed."
	],
	xeno_3: [
		"It pains us to end their",
		"civilization on this ",
		"planet. But it is needed",
		"in order to protect",
		"ourselves from detection."
	],
	xeno_4: [
		"Allitus override controls",
		"are located on this base.",
		"The terminal energy",
		"released by the device",
		"should propel us into",
		"orbit again."
	],
	lift_9_2: [
		"Take the lift down.",
		"This complex houses all",
		"that we know about the",
		"current situation.",
		"<span class='log_important'>[E]</span> to use the lift."
	],
	in_lift_9_2: [
		"You're welcome to take",
		"all you find with you.",
		"<span class='log_important'>[P]</span> to pick things up.",
	],
	info_1_9_2: [
		"The xeno device Allitus",
		"was discovered a year ago.",
		"At first we didn't",
		"understand its purpose.",
		"It was thought to be a",
		"power generator.",
		"Our scientists worked",
		"hard to fire it up.",
		"Some months ago they",
		"succeeded.",
		"However,",
		"We now know it to be",
		"a machine of war.",
		"Your task is to",
		"terminate Allitus.",
		"Next, meet with our",
		"defense counsil at",
		"coordinates <span class='log_important'>c8-f0</span>."
	],
	info_2_9_2: [
		"Since your last visit,",
		"Alien ruins have been",
		"discovered on Targ.",
		"An underground complex",
		"and cave system is",
		"located at <span class='log_important'>d9-42</span>."
	],
	info_3_9_2: [
		"We have requisitioned",
		"a Lightcar for your",
		"travels. It has now been",
		"encoded for your use."
	],
	ok_message: [
		"Memory scan: <span class='log_important'>OK</span>",
		"Disk scan: <span class='log_important'>OK</span>",
		"System health: <span class='log_important'>OK</span>"		
	],
	term_100: "Terminal 100: report",
	term_110: "Terminal 110: report",
	term_120: "Terminal 120: report",
	override: [
		"<span class='log_important'>Override 17A</span> exec:",
		"!System compromised!"
	],
	term_100_or: [
		"The intruder Allitus is",
		"taking over all Targ",
		"communications."
	],
	term_110_or: [
		"Allitus has no known",
		"weakness. To learn more",
		"visit our Xeno studies",
		"lab at <span class='log_important'>36-c9</span>."
	],
	term_120_or: [
		"Allitus is now armed.",
		"It is set to go critical",
		"in $allitus-ttl$ days."
	],
	info_c8_f0: [
		"Defense Council Info:",
		"You're welcome to use",
		"the Defense Computer Array,",
		"via the terminals. Your",
		"security clearance will",
		"decide the info you see."
	],
	override_disk: [
		"You find a disk labeled",
		"Emergency Override 17A",
		"It looks like it fits",
		"some kind of terminal."
	],
	term_20a: "Terminal 20A: report",
	term_20b: "Terminal 20B: report",
	info_1_36_c9: [
		"This area houses",
		"a Xeno artifact.",
		"Please observe posted",
		"health and safety",
		"regulations."
	],
	info_2_36_c9: [
		"This area houses",
		"a Xeno artifact.",
		"Please observe posted",
		"health and safety",
		"regulations."
	],
	info_3_36_c9: [
		"Allitus: a device",
		"of alien origins.",
		"Warning: High Voltage",
		"Ionizing radiation",
		"Posted biohazard",
		"Do not enter."
	],
	allitus_1: "Feels cool to the touch.",
	allitus_on: [
		"An ominous buzzing",
		"sound is emitted."
	],
	allitus_off: "Total silence reigns.",
	drives_with_core: [
		"The drives now have",
		"plasma cores installed.",
		"The xeno ship prepares",
		"to depart from Targ."
	],
	drives_no_core: [
		"These xeno drives need",
		"new plasma cores to",
		"operate again."
	],
	allitus_armed: "Allitus is ARMED",
	allitus_disarmed: "Allitus is disarmed",
	thanks: [
		"The Targ city council is",
		"eternally grateful for",
		"disabling the alien threat.",
		"<span class='log_important'>20000</span> credits have been",
		"added to your account."
	],
	xeno_gibberish: "Xargff norgil Mggarth."
};

var keys = Object.keys(messages).sort();
export const MESSAGES = {};
for(let i = 0; i < keys.length; i++) {
	let k = keys[i];
	MESSAGES[k] = i;
}
export const VALUES = keys.map((k) => messages[k]);
