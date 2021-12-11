$(function() {
	textarea = $("textarea");
});

let champions = [];
let textarea;

/* ---------------------------------------- GENERAL */

function showPage(headingId, pageId) {
	const headings = $(".edit-heading");
	const pages = $(".edit-page");

	headings.each(function() {
		if (this.id == headingId)
			this.classList.add("active");
		else this.classList.remove("active");
	})

	pages.each(function() {
		if (this.id == pageId)
			this.classList.remove("hide");
		else this.classList.add("hide");
	})
}

function printArray(arr) {
	if (Array.isArray(arr)) {
		for (let i in arr) console.log(arr[i]);
	} else {
		for (let i in arr) {
			console.log(i);
			console.log(arr[i]);
		}
	}
}

function stringify(obj) {
	textarea.val(JSON.stringify(obj));
	//
}

/* ---------------------------------------- TAGS */

let tagsEditor = new TagsEditor();

/* ---------------------------------------- CHAMPS */

Champion.loadChampions((data) => champions = data);

function champsSortChampions() {
	champions.sort(Champion.sortComparison);
	textarea.val(JSON.stringify(champions));
}

function champsReadCSVandUpdate() {
	let csvJson = {};
	let rows = textarea.val().split(/\r|\n/);
	let headings = rows[0].split(",");
	let columns = rows[0].split(",").length;
	

	if (headings[0].toLowerCase() != "champion") {
		console.error("! First heading must be 'champion' and the column should contain champion names.");
		return;
	}

	for (let r = 1; r < rows.length; r++) {

		let row = rows[r].split(",");

		csvJson[row[0]] = {}; // create element from champion name

		for (let c = 1; c < columns; c++) { // skip champ name, and loop all columns
			csvJson[row[0]][headings[c]] = row[c];
		}
	}

	let matchFound = [];

	for (let name in csvJson) {
		matchFound[name] = false;
		for (let i in champions) {
			if (champions[i].name == name) {
				// found the champion
				matchFound[name] = true;
				for (let attribute in csvJson[name]) {
					Champion.setAttribute(champions[i], attribute, csvJson[name][attribute]);
				}
			}
		}
	}

	for (let name in matchFound) {
		if (!matchFound[name])
			console.error(`! Unable to update champion's attribute. Champion '${name}' was not found.`);
	}

	textarea.val(JSON.stringify(champions));
}

/* ---------------------------------------- PARSERS */

let riotApi = new RiotApi();
let wikiApi = new WikiApi();

function test() {
	console.log("hello");
	wikiApi.loadReleaseDates();
}