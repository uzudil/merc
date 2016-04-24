import Plates from 'plates'
import $ from 'jquery';
import en_US from 'en_US.json'
import test from 'test.json'

/* Special characters: * - bold, | - line break */
export var LOCALES = {
	"en_US": en_US,
	"test": test
};
export var VALUES = {};
export var MESSAGES = {};
setLocale("en_US");

export function tmpl(el) {
	// http://stackoverflow.com/questions/3614212/jquery-get-html-of-a-whole-element
	let outerHTML = $('<div />').append(el.clone()).html();
	let out = Plates.bind(outerHTML, VALUES);
	//console.log("localizing: el=" + el.attr("id") + " to " + out);
	return el.empty().append($(out).html());
}

export function setLocale(locale) {
	console.log("Setting locale to " + locale);
	VALUES = LOCALES[locale];
	MESSAGES = {};
	for(let k in VALUES) MESSAGES[k] = k;
	for(let e of $(".localized")) tmpl($(e));
}