import JSZip from 'jszip';

console.log("WORKER: starting");
self.addEventListener('message', function(e) {
	var data = e.data.data;
	var name = e.data.name;

	console.log("1. Loaded. Decompressing...");
	var zip = new JSZip(data);
	console.log("2. zip data=", zip);
	let zipObject = zip.file(name);
	console.log("3. zip object=", zipObject);
	let jsonContent = zipObject.asText();
	console.log("4. done.", zip);

	self.postMessage(jsonContent);
	console.log("WORKER: quitting");
	self.close();
}, false);
console.log("WORKER: listening");
