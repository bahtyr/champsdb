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

function print() {
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