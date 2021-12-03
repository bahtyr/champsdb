/**
 * method execution type, add, overwrite
 */
let URL_CHAMP_PORTRAIT = "http://ddragon.leagueoflegends.com/cdn/version/img/champion/";
let URL_CHAMP_SPLASH = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/";
let URL_CHAMP_SPLASH_END = "_0.jpg"
let URL_IMG_PASSIVE = "http://ddragon.leagueoflegends.com/cdn/version/img/passive/";
let URL_IMG_SPELL = "http://ddragon.leagueoflegends.com/cdn/version/img/spell/";
let version;
let champs = [];
let textarea = $("textarea");

let dChamps = new ChampsList(); dChamps.load();
let tags = new ChampTags(); tags.load();
let tagsPrinter;
	// tagsPrinter = new ElementPrinter("#edit-tags-table", "#edit-tags-table .js-template");


$(function() {
	initTableSelectorHandler();
	tagsPrinter = new ElementPrinter("#edit-tags-table", "#edit-tags-table .js-template");

});

/* ---------------------------------------- CHAMPS */

/**
 * Get latest patch version (necessary for other links) from an array of versions.
 */
function loadVersions() {
	$.ajax({type: "GET", url: "https://ddragon.leagueoflegends.com/api/versions.json",
		success: function(data, textStatus) {
			version = data[0];
			URL_CHAMP_PORTRAIT = URL_CHAMP_PORTRAIT.replace("version", version);
			URL_IMG_PASSIVE = URL_IMG_PASSIVE.replace("version", version);
			URL_IMG_SPELL = URL_IMG_SPELL.replace("version", version);
			textarea.val("Patch " + version);
		},
		error: (textStatus, errorThrown) => console.log(errorThrown)
	});
}

/**
 * Get basic champion info.
 * - Name, Title, Tags[Fighter, Tank..], Portrait
 * - More Dataw: Bio, Resource Type, Champion Utility Score
 */
function loadChamps() {
	if (version == null) {
		textarea.val("! Version is not initialized.");
		return;
	}

	$.ajax({
		type: "GET",
		dataType: "json",
		url: `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
		success: function(data, textStatus) {
			let d = data.data;
			for (let i in d) {
				let obj = {};
				obj.id = d[i].id;
				obj.name = d[i].name;
				obj.title = d[i].title;
				obj.tags = d[i].tags;
				obj.portrait = URL_CHAMP_PORTRAIT + d[i].image.full;
				obj.splash = URL_CHAMP_SPLASH + d[i].id + URL_CHAMP_SPLASH_END;
				champs.push(obj);
			}
			console.log(`Array(${champs.length})`);
			console.log(champs);
			console.log(champs[0]);
			textarea.val(JSON.stringify(data));
			// textarea.val(JSON.stringify(champs));
		},
		error: (textStatus, errorThrown) => console.log(errorThrown)
	});
}

/**
 * Start champions' abilities requests.
 */
function loadChampsAbilities() {
	if (version == null || champs.length == 0) {
		textarea.val("! Version is not initialized OR Champs array is empty.");
		return;
	}

	console.log(`Loading abilities for ${champs.length} champions.`);
	requestChampAbilities(0);
}

/**
 * Get a champion's ability name and image.
 */
function requestChampAbilities(i) {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champs[i].id}.json`,
		success: function(data, textStatus) {
			let d = data.data[champs[i].id];
			champs[i].abilities = [];
			champs[i].abilities.push({name: d.passive.name, img: URL_IMG_PASSIVE + d.passive.image.full});
			
			for (let s in d.spells) {
				champs[i].abilities.push({name: d.spells[s].name, img: URL_IMG_SPELL + d.spells[s].image.full});
			}

			if (i < champs.length - 1) {
				i++;
				requestChampAbilities(i);
			} else {
				console.log(`Loaded abilities for ${i+1} champions.`);
				console.log(champs);
			}
		},
		error: (textStatus, errorThrown) => console.log(errorThrown)
	});
}

function printChamps() {
	textarea.val(JSON.stringify(champs));
	//
}

let csvArray = [];
let csvJson = {};
let csvHeadings = [];
function convertCsvToJson() {
	let lines = textarea.val().split(/\r|\n/);
	let headings = lines[0].split(",");
	csvHeadings = headings;

	if (headings[0].toLowerCase() != "champion") {
		console.log("! First column must contain campion names.");
		return;
	}

	csvArray = [];
	csvJson = {};
	for (let i = 1; i < lines.length; i++) {

		let line = lines[i].split(",");
		csvJson[line[0]] = {};
		for (let j = 1; j < line.length; j++) {
			csvJson[line[0]][headings[j]] = line[j];
		}

		// let line = lines[i].split(",");
		// csvArray.push({});
		// for (let j in line) {
			// csvArray[csvArray.length - 1][headings[j]] = line[j];
		// }
	}

	textarea.val(JSON.stringify(csvJson));
}

function updateChampsData() {
	let data = new ChampsList();
	data.load(() => {

		for (let i in data.items) {
			if (csvJson[data.items[i].name] != null) {
				for (let h = 1; h < csvHeadings.length; h++) {
					data.items[i][csvHeadings[h]] = csvJson[data.items[i].name][csvHeadings[h]];
				}
			}
		}

		textarea.val(JSON.stringify(data.items));
	});
}

/* ---------------------------------------- TAGS */

function showTagsObject() {
	tags.clearChampsFromTags();
	textarea.val(JSON.stringify(tags));
}

function showTags() {
	tags.clearChampsFromTags();
	textarea.val(JSON.stringify(tags.items));
}

function showTagMap() {
	textarea.val(JSON.stringify(tags.tagMap));
	//
}

function showTagsWNames() {
	tags.putChampNamesToTags();
	textarea.val(JSON.stringify(tags.items));
}

function showTagsWId() {
	tags.putChampIndexesToTags(dChamps.items);
	textarea.val(JSON.stringify(tags.items));
}

function saveTags() {
	tags.items = JSON.parse(textarea.val());
	//
}

function saveTagMap() {
	tags.tagMap = JSON.parse(textarea.val());
	//
}

/* -------------------- */

function createTagEasy() {
	if (!confirm("Are you sure you want to create a tag from the conole?")) return;

	let s = textarea.val().trim().split("\n");
	let newId = tags.items[tags.items.length - 1].id + 1;
	let name = s[0];
	let champs = s[1].split(",");

	tags.items.push({id: newId, name: name});

	for (let i = 0; i < champs.length; i++) {
		tags.tagMap.push({tagId: newId, champName: champs[i].trim()});
	}

	showTagsObject();
}

function copyMapForNewMap() {
	if (!confirm("Are you sure?")) return;

	let s = textarea.val().trim().split("\n");
	let toCopyId = parseInt(s[0].replace(/[^0-9]/g, ""));
	let newTagId = parseInt(s[1].replace(/[^0-9]/g, ""));
	let newTagName = s[1];

	for (let i = 0; i < tags.tagMap.length; i++) {
		if (tags.tagMap[i].tagId == toCopyId) {
			tags.tagMap.push({tagId: newTagId, champName: tags.tagMap[i].champName});
		}
	}
}

function createTag() {
	if (textarea.val().trim().length == 0) return;

	let lastId = tags.items[tags.items.length - 1].id;
	let name = textarea.val().trim().split("\n")[0]; // ignore new line

	tags.items.push({id: lastId + 1, name: name});
	textarea.val(`id: ${lastId + 1}`);
}

function createTagChampPairs() {
	let lines = textarea.val().split("\n");
	if (lines.length != 2) return;

	let tagId = parseInt(lines[0].replace(/[^0-9]/g, ""));
	let arr = lines[1].split(",");
	let temp = [];

	if (tagId == null) return;

	for (let i = 0; i < arr.length; i++) {
		if (arr[i].trim().length == 0) continue;
		temp.push({tag: tagId, champName: arr[i].trim()})
	}

	textarea.val(JSON.stringify(temp));
}

function attemptToInsertTagChampPairs() {
	let s = textarea.val();
	if (s.length == 0) return;
	s = JSON.parse(s);
	if (!Array.isArray(s) && !Array.isArray(tags.tagMap)) return;

	tags.tagMap.push(...s);

	showTagMap();
}

// TODO
function findNonExistingTagInTagMap() { }

/* ---------------------------------------- TABLE */

let latestTableMode;
function initTableSelectorHandler() {
	$("#edit-tags-selector").on("change", function() {
		latestTableMode = this.value;
		showTagsTable(this.value);
	});
}

function showTagsTable(str) {
	if (str == null) str = latestTableMode;

	tagsPrinter.parent.find("tr.items").remove();

	switch (str) {
		default:
		case "tags":
			tagsPrinter.addAll(tags.items, (holder, i) => {
				holder.find("td:nth-child(1)").text(tags.items[i].id);
				holder.find("td:nth-child(2)").text(tags.items[i].name);
			});
			break;
		case "tags-ids": break;
		case "tags-names": break;
		case "map":
			tagsPrinter.addAll(tags.tagMap, (holder, i) => {
				holder.find("td:nth-child(1)").text(tags.tagMap[i].tagId);
				holder.find("td:nth-child(2)").text(tags.tagMap[i].champName);
			});
			break;
	}
}

function toggleTableVisibility() {
	$("#edit-tags-table").toggleClass("hide");
}

/* ---------------------------------------- GENERAL */

function showPage(i) {
	const h1 = $("h2#heading-notes")[0];
	const h2 = $("h2#heading-champs")[0];
	const h3 = $("h2#heading-tags")[0];
	const p1 = $("#page-notes")[0];
	const p2 = $("#page-champs")[0];
	const p3 = $("#page-tags")[0];

	switch (i) {
		case 1: h1.classList.add("active"); h2.classList.remove("active"); h3.classList.remove("active"); break;
		case 2: h2.classList.add("active"); h1.classList.remove("active"); h3.classList.remove("active"); break;
		case 3: h3.classList.add("active"); h2.classList.remove("active"); h1.classList.remove("active"); break;
	}

	switch (i) {
		case 1: p1.classList.remove("hide"); p2.classList.add("hide"); p3.classList.add("hide"); break;
		case 2: p2.classList.remove("hide"); p1.classList.add("hide"); p3.classList.add("hide"); break;
		case 3: p3.classList.remove("hide"); p2.classList.add("hide"); p1.classList.add("hide"); break;
	}
}