import * as room from 'room'
import * as generator from 'compound_generator'
import * as util from 'util'
import $ from 'jquery'
import THREE from 'three.js';
import JSZip from 'jszip';

// edit these via: http://localhost:8000/compound_editor/rooms.html
export const LEVELS = {
	// info room
	"9,2": {"rooms":[{"x":23,"y":11,"w":8,"h":10,"color":"#ffcccc"},{"x":31,"y":14,"w":15,"h":4,"color":"#ccffcc"},{"x":20,"y":13,"w":3,"h":3,"color":"#ffccff"},{"x":20,"y":17,"w":3,"h":3,"color":"#ccccff"},{"x":46,"y":15,"w":2,"h":2,"color":"#ccffff"},{"x":33,"y":12,"w":2,"h":2,"color":"#ccccff"},{"x":37,"y":12,"w":2,"h":2,"color":"#ffcccc"},{"x":41,"y":12,"w":2,"h":2,"color":"#ffffcc"},{"x":41,"y":18,"w":2,"h":2,"color":"#ffccff"},{"x":37,"y":18,"w":2,"h":2,"color":"#ffcc88"},{"x":33,"y":18,"w":2,"h":2,"color":"#ff8866"},{"x":25,"y":21,"w":4,"h":12,"color":"#ffffcc"},{"x":29,"y":29,"w":5,"h":2,"color":"#ff8866"},{"x":29,"y":25,"w":5,"h":2,"color":"#ffcc88"},{"x":20,"y":25,"w":5,"h":2,"color":"#cccccc"},{"x":20,"y":29,"w":5,"h":2,"color":"#ccffff"}],"doors":[{"x":30,"y":16,"dir":"e","roomA":0,"roomB":1,"key":""},{"x":23,"y":14,"dir":"w","roomA":0,"roomB":2,"key":""},{"x":23,"y":18,"dir":"w","roomA":0,"roomB":3,"key":"keyb"},{"x":27,"y":20,"dir":"s","roomA":0,"roomB":11,"key":"keya"},{"x":45,"y":16,"dir":"e","roomA":1,"roomB":4,"key":""},{"x":34,"y":14,"dir":"n","roomA":1,"roomB":5,"key":""},{"x":38,"y":14,"dir":"n","roomA":1,"roomB":6,"key":""},{"x":42,"y":14,"dir":"n","roomA":1,"roomB":7,"key":""},{"x":42,"y":17,"dir":"s","roomA":1,"roomB":8,"key":""},{"x":38,"y":17,"dir":"s","roomA":1,"roomB":9,"key":""},{"x":34,"y":17,"dir":"s","roomA":1,"roomB":10,"key":""},{"x":28,"y":30,"dir":"e","roomA":11,"roomB":12,"key":""},{"x":28,"y":26,"dir":"e","roomA":11,"roomB":13,"key":""},{"x":25,"y":26,"dir":"w","roomA":11,"roomB":14,"key":""},{"x":25,"y":30,"dir":"w","roomA":11,"roomB":15,"key":""}],"objects":[{"x":41,"y":12,"object":"keya","room":7},{"x":20,"y":30,"object":"keyb","room":15},{"x":20,"y":18,"object":"pres","room":3},{"x":29,"y":25,"object":"pres","room":13},{"x":20,"y":25,"object":"pres","room":14}]},

	// xeno ruins
	"d9,42": {"rooms":[{"x":12,"y":8,"w":3,"h":3,"color":"#ffcccc"},{"x":15,"y":9,"w":8,"h":1,"color":"#ffffcc"},{"x":23,"y":8,"w":3,"h":3,"color":"#ccffcc"},{"x":24,"y":11,"w":1,"h":4,"color":"#ccccff"},{"x":21,"y":15,"w":7,"h":3,"color":"#ccffff"},{"x":18,"y":16,"w":3,"h":1,"color":"#cccccc"},{"x":15,"y":15,"w":3,"h":3,"color":"#ffcc88"},{"x":23,"y":18,"w":3,"h":5,"color":"#ccffcc"},{"x":24,"y":23,"w":1,"h":3,"color":"#ffcccc"},{"x":23,"y":26,"w":3,"h":8,"color":"#ccccff","cave":false},{"x":26,"y":27,"w":6,"h":2,"color":"#cccccc","cave":true},{"x":29,"y":32,"w":3,"h":6,"color":"#ffcc88","cave":false},{"x":32,"y":37,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":32,"y":33,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":33,"y":30,"w":4,"h":3,"color":"#ffffcc","cave":false},{"x":30,"y":25,"w":1,"h":2,"color":"#cccccc","cave":true},{"x":29,"y":23,"w":10,"h":2,"color":"#cccccc","cave":true},{"x":35,"y":27,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":36,"y":28,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":37,"y":32,"w":2,"h":1,"color":"#cccccc","cave":true},{"x":38,"y":33,"w":2,"h":3,"color":"#cccccc","cave":true},{"x":40,"y":27,"w":4,"h":3,"color":"#ff8866","cave":false},{"x":39,"y":24,"w":5,"h":1,"color":"#cccccc","cave":true},{"x":41,"y":25,"w":2,"h":2,"color":"#cccccc","cave":true},{"x":36,"y":20,"w":2,"h":3,"color":"#ffccff","cave":false},{"x":31,"y":20,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":26,"y":35,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":27,"y":36,"w":1,"h":5,"color":"#cccccc","cave":true},{"x":28,"y":39,"w":8,"h":1,"color":"#cccccc","cave":true},{"x":24,"y":38,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":23,"y":34,"w":1,"h":5,"color":"#cccccc","cave":true},{"x":36,"y":37,"w":3,"h":4,"color":"#ccffcc","cave":false},{"x":33,"y":34,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":32,"y":21,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":39,"y":39,"w":4,"h":2,"color":"#cccccc","cave":true},{"x":43,"y":33,"w":1,"h":7,"color":"#cccccc","cave":true},{"x":40,"y":35,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":13,"y":11,"w":1,"h":10,"color":"#ccffff"},{"x":13,"y":24,"w":1,"h":8,"color":"#ccffff"},{"x":14,"y":31,"w":9,"h":1,"color":"#cccccc","cave":true},{"x":10,"y":21,"w":7,"h":3,"color":"#ccffff"},{"x":31,"y":40,"w":1,"h":2,"color":"#cccccc","cave":true},{"x":17,"y":32,"w":1,"h":3,"color":"#cccccc","cave":true},{"x":17,"y":35,"w":6,"h":1,"color":"#cccccc","cave":true},{"x":30,"y":42,"w":3,"h":3,"color":"#ffffcc","cave":false},{"x":14,"y":35,"w":3,"h":3,"color":"#ffcc88","cave":false},{"x":44,"y":36,"w":3,"h":3,"color":"#ccffff","cave":false},{"x":40,"y":30,"w":1,"h":4,"color":"#cccccc","cave":true}],"doors":[{"x":14,"y":9,"dir":"e","roomA":0,"roomB":1,"key":""},{"x":13,"y":10,"dir":"s","roomA":0,"roomB":37,"key":""},{"x":22,"y":9,"dir":"e","roomA":1,"roomB":2,"key":""},{"x":24,"y":10,"dir":"s","roomA":2,"roomB":3,"key":""},{"x":24,"y":14,"dir":"s","roomA":3,"roomB":4,"key":""},{"x":21,"y":16,"dir":"w","roomA":4,"roomB":5,"key":""},{"x":24,"y":17,"dir":"s","roomA":4,"roomB":7,"key":"keyc"},{"x":18,"y":16,"dir":"w","roomA":5,"roomB":6,"key":""},{"x":24,"y":22,"dir":"s","roomA":7,"roomB":8,"key":""},{"x":24,"y":25,"dir":"s","roomA":8,"roomB":9,"key":""},{"x":25,"y":28,"dir":"e","roomA":9,"roomB":10,"key":""},{"x":23,"y":33,"dir":"s","roomA":9,"roomB":30,"key":""},{"x":23,"y":31,"dir":"w","roomA":9,"roomB":39,"key":""},{"x":30,"y":27,"dir":"n","roomA":10,"roomB":15,"key":""},{"x":31,"y":37,"dir":"e","roomA":11,"roomB":12,"key":""},{"x":31,"y":33,"dir":"e","roomA":11,"roomB":13,"key":""},{"x":29,"y":35,"dir":"w","roomA":11,"roomB":26,"key":""},{"x":35,"y":37,"dir":"e","roomA":12,"roomB":31,"key":""},{"x":33,"y":37,"dir":"n","roomA":12,"roomB":32,"key":""},{"x":34,"y":33,"dir":"n","roomA":13,"roomB":14,"key":""},{"x":33,"y":33,"dir":"s","roomA":13,"roomB":32,"key":""},{"x":35,"y":30,"dir":"n","roomA":14,"roomB":17,"key":""},{"x":36,"y":32,"dir":"e","roomA":14,"roomB":19,"key":""},{"x":30,"y":25,"dir":"n","roomA":15,"roomB":16,"key":""},{"x":38,"y":24,"dir":"e","roomA":16,"roomB":22,"key":""},{"x":37,"y":23,"dir":"n","roomA":16,"roomB":24,"key":""},{"x":31,"y":23,"dir":"n","roomA":16,"roomB":25,"key":""},{"x":35,"y":28,"dir":"e","roomA":17,"roomB":18,"key":""},{"x":39,"y":28,"dir":"e","roomA":18,"roomB":21,"key":""},{"x":38,"y":32,"dir":"s","roomA":19,"roomB":20,"key":""},{"x":39,"y":35,"dir":"e","roomA":20,"roomB":36,"key":""},{"x":39,"y":33,"dir":"e","roomA":20,"roomB":47,"key":""},{"x":42,"y":27,"dir":"n","roomA":21,"roomB":23,"key":""},{"x":40,"y":29,"dir":"s","roomA":21,"roomB":47,"key":""},{"x":42,"y":24,"dir":"s","roomA":22,"roomB":23,"key":""},{"x":36,"y":21,"dir":"w","roomA":24,"roomB":33,"key":""},{"x":31,"y":21,"dir":"e","roomA":25,"roomB":33,"key":""},{"x":27,"y":35,"dir":"s","roomA":26,"roomB":27,"key":""},{"x":27,"y":39,"dir":"e","roomA":27,"roomB":28,"key":""},{"x":27,"y":38,"dir":"w","roomA":27,"roomB":29,"key":""},{"x":35,"y":39,"dir":"e","roomA":28,"roomB":31,"key":""},{"x":31,"y":39,"dir":"s","roomA":28,"roomB":41,"key":""},{"x":24,"y":38,"dir":"w","roomA":29,"roomB":30,"key":""},{"x":23,"y":35,"dir":"w","roomA":30,"roomB":43,"key":""},{"x":38,"y":40,"dir":"e","roomA":31,"roomB":34,"key":""},{"x":42,"y":39,"dir":"e","roomA":34,"roomB":35,"key":""},{"x":43,"y":35,"dir":"w","roomA":35,"roomB":36,"key":""},{"x":43,"y":37,"dir":"e","roomA":35,"roomB":46,"key":""},{"x":13,"y":20,"dir":"s","roomA":37,"roomB":40,"key":"keyd"},{"x":13,"y":31,"dir":"e","roomA":38,"roomB":39,"key":""},{"x":13,"y":24,"dir":"n","roomA":38,"roomB":40,"key":"keyd"},{"x":17,"y":31,"dir":"s","roomA":39,"roomB":42,"key":""},{"x":31,"y":41,"dir":"s","roomA":41,"roomB":44,"key":""},{"x":17,"y":34,"dir":"s","roomA":42,"roomB":43,"key":""},{"x":17,"y":35,"dir":"w","roomA":43,"roomB":45,"key":""}],"objects":[{"x":15,"y":16,"object":"keyc","room":8},{"x":36,"y":40,"object":"keyd","room":39},{"x":33,"y":31,"object":"trans","room":17,"rot":-90},{"x":14,"y":36,"object":"core","room":53,"rot":null},{"x":46,"y":37,"object":"core","room":54,"rot":null}],"teleporters":[{"roomA":44,"roomB":24},{"roomA":45,"roomB":46}]},

	// defense council
	"c8,f0": {"rooms":[{"x":38,"y":33,"w":4,"h":4,"color":"#ffcccc","cave":false},{"x":39,"y":20,"w":2,"h":13,"color":"#ccccff","cave":false},{"x":39,"y":37,"w":2,"h":13,"color":"#ccffcc","cave":false},{"x":42,"y":34,"w":3,"h":2,"color":"#ffffcc","cave":false},{"x":35,"y":34,"w":3,"h":2,"color":"#ff8866","cave":false},{"x":45,"y":32,"w":4,"h":6,"color":"#ffcc88","cave":false},{"x":31,"y":32,"w":4,"h":6,"color":"#ffffcc","cave":false},{"x":38,"y":16,"w":4,"h":4,"color":"#ccffff","cave":false},{"x":38,"y":50,"w":4,"h":4,"color":"#ffccff","cave":false},{"x":42,"y":16,"w":13,"h":4,"color":"#cccccc","cave":false},{"x":42,"y":50,"w":13,"h":4,"color":"#cccccc","cave":false},{"x":43,"y":20,"w":2,"h":3,"color":"#ffcc88","cave":false},{"x":46,"y":20,"w":2,"h":3,"color":"#ffffcc","cave":false},{"x":49,"y":20,"w":2,"h":3,"color":"#ccffff","cave":false},{"x":52,"y":20,"w":2,"h":3,"color":"#ffccff","cave":false},{"x":43,"y":47,"w":2,"h":3,"color":"#ccffff","cave":false},{"x":46,"y":47,"w":2,"h":3,"color":"#ffcccc","cave":false},{"x":49,"y":47,"w":2,"h":3,"color":"#ffcc88","cave":false},{"x":52,"y":47,"w":2,"h":3,"color":"#ccccff","cave":false},{"x":42,"y":23,"w":4,"h":6,"color":"#ffffcc","cave":false},{"x":46,"y":26,"w":5,"h":1,"color":"#cccccc","cave":true},{"x":48,"y":27,"w":1,"h":5,"color":"#cccccc","cave":true},{"x":49,"y":29,"w":6,"h":1,"color":"#cccccc","cave":true},{"x":57,"y":32,"w":5,"h":5,"color":"#ccffcc","cave":false},{"x":58,"y":18,"w":1,"h":14,"color":"#cccccc","cave":true},{"x":55,"y":18,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":54,"y":22,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":55,"y":23,"w":1,"h":7,"color":"#cccccc","cave":true},{"x":62,"y":40,"w":1,"h":5,"color":"#cccccc","cave":true},{"x":63,"y":40,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":65,"y":36,"w":1,"h":4,"color":"#cccccc","cave":true},{"x":63,"y":36,"w":2,"h":1,"color":"#cccccc","cave":true},{"x":63,"y":22,"w":1,"h":14,"color":"#cccccc","cave":true},{"x":59,"y":22,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":64,"y":28,"w":3,"h":1,"color":"#ffffcc","cave":true},{"x":67,"y":26,"w":4,"h":5,"color":"#ff8866","cave":false},{"x":66,"y":38,"w":3,"h":1,"color":"#cccccc","cave":true},{"x":69,"y":37,"w":3,"h":3,"color":"#ffffcc","cave":false},{"x":52,"y":30,"w":1,"h":17,"color":"#cccccc","cave":true},{"x":53,"y":34,"w":4,"h":1,"color":"#cccccc","cave":true},{"x":53,"y":44,"w":9,"h":1,"color":"#cccccc","cave":true},{"x":58,"y":37,"w":1,"h":7,"color":"#cccccc","cave":true}],"doors":[{"x":40,"y":33,"dir":"n","roomA":0,"roomB":1,"key":""},{"x":40,"y":36,"dir":"s","roomA":0,"roomB":2,"key":""},{"x":41,"y":35,"dir":"e","roomA":0,"roomB":3,"key":""},{"x":38,"y":35,"dir":"w","roomA":0,"roomB":4,"key":""},{"x":40,"y":20,"dir":"n","roomA":1,"roomB":7,"key":""},{"x":40,"y":49,"dir":"s","roomA":2,"roomB":8,"key":""},{"x":44,"y":35,"dir":"e","roomA":3,"roomB":5,"key":""},{"x":35,"y":35,"dir":"w","roomA":4,"roomB":6,"key":""},{"x":48,"y":32,"dir":"n","roomA":5,"roomB":21,"key":""},{"x":41,"y":18,"dir":"e","roomA":7,"roomB":9,"key":"keya"},{"x":41,"y":52,"dir":"e","roomA":8,"roomB":10,"key":"keya"},{"x":44,"y":19,"dir":"s","roomA":9,"roomB":11,"key":""},{"x":47,"y":19,"dir":"s","roomA":9,"roomB":12,"key":""},{"x":50,"y":19,"dir":"s","roomA":9,"roomB":13,"key":""},{"x":53,"y":19,"dir":"s","roomA":9,"roomB":14,"key":""},{"x":54,"y":18,"dir":"e","roomA":9,"roomB":25,"key":""},{"x":44,"y":50,"dir":"n","roomA":10,"roomB":15,"key":""},{"x":47,"y":50,"dir":"n","roomA":10,"roomB":16,"key":""},{"x":50,"y":50,"dir":"n","roomA":10,"roomB":17,"key":""},{"x":53,"y":50,"dir":"n","roomA":10,"roomB":18,"key":""},{"x":44,"y":22,"dir":"s","roomA":11,"roomB":19,"key":""},{"x":53,"y":22,"dir":"e","roomA":14,"roomB":26,"key":""},{"x":52,"y":47,"dir":"n","roomA":18,"roomB":38,"key":""},{"x":45,"y":26,"dir":"e","roomA":19,"roomB":20,"key":""},{"x":48,"y":26,"dir":"s","roomA":20,"roomB":21,"key":""},{"x":48,"y":29,"dir":"e","roomA":21,"roomB":22,"key":""},{"x":54,"y":29,"dir":"e","roomA":22,"roomB":27,"key":""},{"x":52,"y":29,"dir":"s","roomA":22,"roomB":38,"key":""},{"x":58,"y":32,"dir":"n","roomA":23,"roomB":24,"key":""},{"x":57,"y":34,"dir":"w","roomA":23,"roomB":39,"key":""},{"x":58,"y":36,"dir":"s","roomA":23,"roomB":41,"key":""},{"x":58,"y":18,"dir":"w","roomA":24,"roomB":25,"key":""},{"x":58,"y":22,"dir":"w","roomA":24,"roomB":26,"key":""},{"x":58,"y":22,"dir":"e","roomA":24,"roomB":33,"key":""},{"x":55,"y":22,"dir":"s","roomA":26,"roomB":27,"key":""},{"x":62,"y":40,"dir":"e","roomA":28,"roomB":29,"key":""},{"x":62,"y":44,"dir":"w","roomA":28,"roomB":40,"key":""},{"x":65,"y":40,"dir":"n","roomA":29,"roomB":30,"key":""},{"x":65,"y":36,"dir":"w","roomA":30,"roomB":31,"key":""},{"x":65,"y":38,"dir":"e","roomA":30,"roomB":36,"key":""},{"x":63,"y":36,"dir":"n","roomA":31,"roomB":32,"key":""},{"x":63,"y":22,"dir":"w","roomA":32,"roomB":33,"key":""},{"x":63,"y":28,"dir":"e","roomA":32,"roomB":34,"key":""},{"x":66,"y":28,"dir":"e","roomA":34,"roomB":35,"key":""},{"x":68,"y":38,"dir":"e","roomA":36,"roomB":37,"key":""},{"x":52,"y":34,"dir":"e","roomA":38,"roomB":39,"key":""},{"x":52,"y":44,"dir":"e","roomA":38,"roomB":40,"key":""},{"x":58,"y":44,"dir":"n","roomA":40,"roomB":41,"key":""}],"objects":[{"x":38,"y":34,"object":"pres","room":0},{"x":38,"y":17,"object":"term","room":7,"rot":-90},{"x":38,"y":52,"object":"term","room":8,"rot":-90},{"x":70,"y":28,"object":"disk","room":48,"rot":null}],"teleporters":[{"roomA":7,"roomB":8},{"roomA":37,"roomB":6}]},

	// xeno lab
	"36,c9": {"rooms":[{"x":46,"y":32,"w":6,"h":6,"color":"#ffcccc","cave":false},{"x":45,"y":24,"w":3,"h":8,"color":"#ccffcc","cave":false},{"x":50,"y":24,"w":3,"h":8,"color":"#ccffff","cave":false},{"x":51,"y":22,"w":1,"h":2,"color":"#ff8866","cave":false},{"x":50,"y":19,"w":3,"h":3,"color":"#ffffcc","cave":false},{"x":43,"y":25,"w":2,"h":1,"color":"#ffffcc","cave":false},{"x":43,"y":29,"w":2,"h":1,"color":"#ffffcc","cave":false},{"x":40,"y":28,"w":3,"h":3,"color":"#ffcc88","cave":false},{"x":40,"y":24,"w":3,"h":3,"color":"#ccccff","cave":false},{"x":53,"y":29,"w":2,"h":1,"color":"#ffffcc","cave":false},{"x":55,"y":28,"w":3,"h":3,"color":"#ccffcc","cave":false},{"x":47,"y":38,"w":1,"h":2,"color":"#ffffcc","cave":false},{"x":46,"y":40,"w":3,"h":3,"color":"#ffcc88","cave":false},{"x":47,"y":43,"w":1,"h":2,"color":"#ffffcc","cave":false},{"x":46,"y":45,"w":3,"h":3,"color":"#ccccff","cave":false},{"x":47,"y":48,"w":1,"h":2,"color":"#ffffcc","cave":false},{"x":46,"y":50,"w":3,"h":3,"color":"#ffccff","cave":false},{"x":63,"y":50,"w":3,"h":3,"color":"#ccffff","cave":false},{"x":64,"y":36,"w":1,"h":14,"color":"#cccccc","cave":true},{"x":63,"y":33,"w":3,"h":3,"color":"#ffcccc","cave":false},{"x":56,"y":31,"w":1,"h":4,"color":"#cccccc","cave":true},{"x":57,"y":34,"w":6,"h":1,"color":"#cccccc","cave":true},{"x":49,"y":51,"w":14,"h":1,"color":"#cccccc","cave":true},{"x":54,"y":38,"w":7,"h":10,"color":"#ff8866","cave":false},{"x":56,"y":48,"w":3,"h":3,"color":"#cccccc","cave":false},{"x":61,"y":42,"w":3,"h":3,"color":"#cccccc","cave":false}],"doors":[{"x":47,"y":32,"dir":"n","roomA":0,"roomB":1,"key":""},{"x":51,"y":32,"dir":"n","roomA":0,"roomB":2,"key":""},{"x":47,"y":37,"dir":"s","roomA":0,"roomB":11,"key":""},{"x":45,"y":25,"dir":"w","roomA":1,"roomB":5,"key":""},{"x":45,"y":29,"dir":"w","roomA":1,"roomB":6,"key":""},{"x":51,"y":24,"dir":"n","roomA":2,"roomB":3,"key":""},{"x":52,"y":29,"dir":"e","roomA":2,"roomB":9,"key":""},{"x":51,"y":22,"dir":"n","roomA":3,"roomB":4,"key":""},{"x":43,"y":25,"dir":"w","roomA":5,"roomB":8,"key":""},{"x":43,"y":29,"dir":"w","roomA":6,"roomB":7,"key":""},{"x":54,"y":29,"dir":"e","roomA":9,"roomB":10,"key":"keyd"},{"x":56,"y":30,"dir":"s","roomA":10,"roomB":20,"key":""},{"x":47,"y":39,"dir":"s","roomA":11,"roomB":12,"key":""},{"x":47,"y":42,"dir":"s","roomA":12,"roomB":13,"key":""},{"x":47,"y":44,"dir":"s","roomA":13,"roomB":14,"key":""},{"x":47,"y":47,"dir":"s","roomA":14,"roomB":15,"key":""},{"x":47,"y":49,"dir":"s","roomA":15,"roomB":16,"key":"keyd"},{"x":48,"y":51,"dir":"e","roomA":16,"roomB":22,"key":""},{"x":64,"y":50,"dir":"n","roomA":17,"roomB":18,"key":""},{"x":63,"y":51,"dir":"w","roomA":17,"roomB":22,"key":""},{"x":64,"y":36,"dir":"n","roomA":18,"roomB":19,"key":""},{"x":64,"y":43,"dir":"w","roomA":18,"roomB":25,"key":""},{"x":63,"y":34,"dir":"w","roomA":19,"roomB":21,"key":""},{"x":56,"y":34,"dir":"e","roomA":20,"roomB":21,"key":""},{"x":57,"y":51,"dir":"n","roomA":22,"roomB":24,"key":""},{"x":57,"y":47,"dir":"s","roomA":23,"roomB":24,"key":"keyc"},{"x":60,"y":43,"dir":"e","roomA":23,"roomB":25,"key":"keyc"}],"objects":[{"x":50,"y":19,"object":"keyd","room":4,"rot":null},{"x":46,"y":51,"object":"pres","room":16,"rot":null},{"x":65,"y":34,"object":"pres","room":19,"rot":180},{"x":40,"y":29,"object":"term","room":7,"rot":-90},{"x":40,"y":25,"object":"term","room":8,"rot":-90},{"x":56,"y":48,"object":"pres","room":24,"rot":0},{"x":61,"y":42,"object":"pres","room":25,"rot":0},{"x":65,"y":52,"object":"art","room":17,"rot":45},{"x":57,"y":41,"object":"allitus","room":23,"rot":null}]},

	// xeno base
	"f8,c9": {"rooms":[{"x":31,"y":24,"w":6,"h":6,"color":"#ffcccc","cave":false},{"x":28,"y":26,"w":3,"h":3,"color":"#ffcc88","cave":false},{"x":37,"y":26,"w":4,"h":2,"color":"#cccccc","cave":false},{"x":41,"y":25,"w":4,"h":4,"color":"#ff8866","cave":false},{"x":77,"y":26,"w":3,"h":3,"color":"#ff8866","cave":false},{"x":73,"y":24,"w":4,"h":7,"color":"#ffccff","cave":false},{"x":70,"y":25,"w":3,"h":2,"color":"#ccffff","cave":false},{"x":70,"y":28,"w":3,"h":2,"color":"#ffcc88","cave":false},{"x":74,"y":22,"w":2,"h":2,"color":"#ffffcc","cave":false},{"x":69,"y":51,"w":2,"h":2,"color":"#ccffcc","cave":false},{"x":68,"y":46,"w":4,"h":5,"color":"#ccccff","cave":false},{"x":65,"y":47,"w":3,"h":3,"color":"#cccccc","cave":false},{"x":72,"y":47,"w":3,"h":3,"color":"#cccccc","cave":false},{"x":69,"y":35,"w":1,"h":11,"color":"#cccccc","cave":false},{"x":66,"y":36,"w":3,"h":3,"color":"#ffcccc","cave":false},{"x":70,"y":36,"w":3,"h":3,"color":"#ccffcc","cave":false},{"x":66,"y":40,"w":3,"h":3,"color":"#ffffcc","cave":false},{"x":70,"y":40,"w":3,"h":3,"color":"#ffcc88","cave":false},{"x":68,"y":32,"w":3,"h":3,"color":"#ccffff","cave":false},{"x":33,"y":30,"w":2,"h":3,"color":"#ffccff","cave":false},{"x":32,"y":20,"w":4,"h":4,"color":"#ccffff","cave":false},{"x":45,"y":26,"w":2,"h":2,"color":"#cccccc","cave":false},{"x":52,"y":26,"w":2,"h":2,"color":"#cccccc","cave":false},{"x":54,"y":25,"w":8,"h":4,"color":"#cccccc","cave":false}],"doors":[{"x":31,"y":27,"dir":"w","roomA":0,"roomB":1,"key":""},{"x":36,"y":27,"dir":"e","roomA":0,"roomB":2,"key":""},{"x":34,"y":29,"dir":"s","roomA":0,"roomB":19,"key":""},{"x":34,"y":24,"dir":"n","roomA":0,"roomB":20,"key":""},{"x":40,"y":27,"dir":"e","roomA":2,"roomB":3,"key":""},{"x":44,"y":27,"dir":"e","roomA":3,"roomB":21,"key":""},{"x":77,"y":27,"dir":"w","roomA":4,"roomB":5,"key":""},{"x":73,"y":26,"dir":"w","roomA":5,"roomB":6,"key":""},{"x":73,"y":29,"dir":"w","roomA":5,"roomB":7,"key":""},{"x":75,"y":24,"dir":"n","roomA":5,"roomB":8,"key":""},{"x":70,"y":51,"dir":"n","roomA":9,"roomB":10,"key":""},{"x":68,"y":48,"dir":"w","roomA":10,"roomB":11,"key":""},{"x":71,"y":48,"dir":"e","roomA":10,"roomB":12,"key":""},{"x":69,"y":46,"dir":"n","roomA":10,"roomB":13,"key":""},{"x":69,"y":37,"dir":"w","roomA":13,"roomB":14,"key":""},{"x":69,"y":37,"dir":"e","roomA":13,"roomB":15,"key":""},{"x":69,"y":41,"dir":"w","roomA":13,"roomB":16,"key":""},{"x":69,"y":41,"dir":"e","roomA":13,"roomB":17,"key":""},{"x":69,"y":35,"dir":"n","roomA":13,"roomB":18,"key":""},{"x":53,"y":27,"dir":"e","roomA":22,"roomB":23,"key":""}],"objects":[{"x":33,"y":20,"object":"xenterm","room":20,"rot":null},{"x":42,"y":25,"object":"xenterm","room":3,"rot":null},{"x":43,"y":25,"object":"xenterm","room":3,"rot":null},{"x":67,"y":36,"object":"control","room":14,"rot":null},{"x":57,"y":26,"object":"engine","room":23,"rot":90},{"x":57,"y":27,"object":"engine","room":23,"rot":90}],"teleporters":[{"roomA":4,"roomB":1},{"roomA":8,"roomB":9},{"roomA":19,"roomB":18},{"roomA":21,"roomB":22}]}
};

const LEVEL_CACHE = {};
export function loadLevel(sectorX, sectorY, onload) {
	let name = util.toHex(sectorX, 2) + util.toHex(sectorY, 2) + ".json";
	if(LEVEL_CACHE[name]) {
		onload(LEVEL_CACHE[name]);
	} else {
		util.startLoadingUI();
		util.setLoadingUIProgress(0, ()=> {
			console.log("Loading model=" + name);
			let zipName = "models/compounds/" + name + ".zip";
			//console.log("Loading zip=" + zipName);
			$.ajax({
				dataType: "binary",
				processData: false,
				responseType: "arraybuffer",
				type: 'GET',
				url: zipName + "?cb=" + window.cb,
				progress: function (percentComplete) {
					//console.log(percentComplete);
					$("#progress-value").css("width", (80 * percentComplete) + "%");
				},
				success: function (data) {
					decompressLevel(name, data, sectorX, sectorY, onload);
				},
				error: (err) => {
					console.log("Error downloading zip file: " + zipName + " error=" + err);
				}
			});
		});
	}
}

function parseGeometry(index, geometries, jsonGeometries, loader, onload) {
	setTimeout(()=> {
		console.log("Parsing geometry " + index + " of " + jsonGeometries.length);
		let geo = jsonGeometries[index];
		console.log("1");
		let g = loader.parseGeometries([geo]);
		console.log("2");
		Object.assign(geometries, g);
		console.log("3");

		index++;
		if(index < jsonGeometries.length) {
			parseGeometry(index, geometries, jsonGeometries, loader, onload);
		} else {
			console.log("Done loading geos.");
			onload();
		}

	}, 100);
}

function decompressLevel(name, data, sectorX, sectorY, onload) {
	util.setLoadingUIProgress(80, ()=> {
		console.log("Starting worker");
		let worker = new Worker('dist/zip_worker.js?v=' + window.cb);
		console.log("Listening for worker");
		worker.addEventListener('message', (e) => {
			let jsonContent = e.data;
			util.setLoadingUIProgress(90, ()=> {
				console.log("Deleting worker.");
				worker = undefined;

				console.log("Parsing JSON... json size=", jsonContent.length);
				let json = JSON.parse(jsonContent);
				console.log("JSON parsed");

				let loader = new THREE.ObjectLoader();
				console.log("Constructing object...");
				//let obj = loader.parse(json);

				let geometries = {};
				parseGeometry(0, geometries, json.geometries, loader, () => {
					console.log("parsing materials");
					let materials = loader.parseMaterials( json.materials, null );

					console.log("parsing object");
					let obj = loader.parseObject( json.object, geometries, materials );

					console.log("constructed=", obj);
					util.setLoadingUIProgress(100, ()=> {
						console.log("done loading level 1");
						util.stopLoadingUI();
						console.log("done loading level 2");
						let level = getLevel(sectorX, sectorY, obj);
						LEVEL_CACHE[name] = level;
						onload(level);
					});
				});
			});
		}, false);
		console.log("Messaging worker");
		worker.postMessage({ data: data, name: name });
		console.log("Waiting...");
	});
}

function getLevel(sectorX, sectorY, obj=null) {
	let key = "" + sectorX.toString(16) + "," + sectorY.toString(16);
	console.log("Looking for compound=" + key + " found=" + LEVELS[key]);
	return new room.Level(LEVELS[key], obj);
}

window.generate = function(sectorX, sectorY) {
	let level = getLevel(sectorX, sectorY);
	let gen = new generator.CompoundGenerator(level.rooms, level.doors, level.objects, window.models, level.w, level.h);
	console.log("Generating...");
	gen.generate();
	console.log("JSONifying...");
	let s = JSON.stringify(gen.mesh.toJSON());
	console.log("JSON size=" + s.length);

	// timeout so the page doesn't crash (yield to main thread)
	setTimeout(()=> {
		console.log("Uploading...");
			$.ajax({
				type: 'POST',
				url: "http://localhost:9090/cgi-bin/upload.py",
				data: "name=" + util.toHex(sectorX, 2) + util.toHex(sectorY, 2) + "&file=" + s,
				success: ()=>{console.log("Success!");},
				error: (error)=>{console.log("error: ", error);},
				dataType: "text/json"
			});
			console.log("Stored on server.");
	}, 500);
};
