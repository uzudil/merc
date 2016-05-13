import Plates from 'plates'
import $ from 'jquery';
import en_US from 'en_US.json'
import de_DE from 'de_DE.json'
import es_MX from 'es_MX.json'

/* Special characters: * - bold, | - line break */
export var LOCALES = {
	"English": en_US,
	"German": de_DE,
	"Spanish": es_MX,
};
export var VALUES = {};
export var MESSAGES = {};
const DEFAULT_LOCALE = "English";
setLocale(DEFAULT_LOCALE);

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

	// fill-in english versions if native is missing
	let en_VALUES = LOCALES[DEFAULT_LOCALE];
	for(let k in VALUES) {
		if(!VALUES[k]) VALUES[k] = en_VALUES[k];
	}

	MESSAGES = {};
	for(let k in VALUES) MESSAGES[k] = k;
	for(let e of $(".localized")) tmpl($(e));
}