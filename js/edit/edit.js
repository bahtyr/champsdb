var champions = [];
var tags      = [];
let ddragon = new DDragon;

fetch("data/champions.json").then(data => data.json()).then(json => {
	champions = json.map(item => ChampionFunctions.transfer(item));
});

fetch("data/tags.json").then(data => data.json()).then(json => {
	tags = json;
});

function log(str) {
	$tag("textarea")[0].value = str;
	// console.log(str);
}

/****************************************** UPDATE DATA ******************************************/

function updateChamps() { updateData("champions", champions); }
function updateData(fileName, data) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => (xhr.readyState === 4) && console.log(xhr.responseText);
	xhr.open("POST", "./js/server/update.php?file="+fileName, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(data, null, 2));
}

/****************************************** TAGS *************************************************/

function _createTag(name) {
	let newId = tags[tags.length - 1].id + 1;
	tags.push({id: newId, name: name, champIndexes: []});
	return newId;
}

/******************/

function _addTagToChamps(tagId) {
	if (tagId == null)
		tagId = parseInt($tag("textarea")[1].value);
	let input = $tag("textarea")[0].value.split(/\r|\n/);
	input.forEach(e => _addTagToChamp(tagId, e));
}

function _addTagToChamp(tagId, champString) {
	let s = champString.split("#");
	let champName = s[0];
	let tagArraysIndex = s.length == 2 ? parseInt(s[1])+1 : 0;

	// champ = champions.find(({ids}) => ids.pascal.toLowerCase() === champName.toLowerCase());
	champ = champions.find(({name}) => name === champName);

	// champ not found
	if (!champ) console.error("Champion not found: " + champString);
	// champ has the tag
	else if (champ.tagArrays[tagArraysIndex].includes(tagId)) console.warn("Champion already has the tag. " + champString + "  " + tagId);
	// success
	else champ.tagArrays[tagArraysIndex].push(tagId);
}

function _removeTagFromChamps(tagId) {
	if (tagId == null)
		tagId = parseInt($tag("textarea")[1].value);
	let input = $tag("textarea")[0].value.split(/\r|\n/);
	input.forEach(e => _removeTagFromChamp(tagId, e));
}

function _removeTagFromChamp(tagId, champString) {
	let s = champString.split("#");
	let champName = s[0];
	let tagArraysIndex = s.length == 2 ? parseInt(s[1])+1 : 0;

	// champ = champions.find(({ids}) => ids.pascal.toLowerCase() === champName.toLowerCase());
	champ = champions.find(({name}) => name === champName);

	// champ not found
	if (!champ) {
		console.error("Champion not found: " + champString);
		return;
	}

	// champ has the tag
	let indexOf = champ.tagArrays[tagArraysIndex].indexOf(tagId);
	if (indexOf != -1) {
		champ.tagArrays[tagArraysIndex].splice(indexOf, 1);
	} else console.warn("Champion does not have the tag. " + champString + "  " + tagId);
}

/****************************************** FETCH ALL ********************************************/

var fetchAll = {
	urls: [],
	i: 0,
	clear: function() { this.urls = []; this.callback = function() {} },
	callback: function() {},

	start: function() {
		if (this.urls.length == 0) {
			console.error("fetcAll.urls[] is empty!");
			return;
		}
		log("Starting fetch all.");
		this.i = 0;
		this.fetchUrl(this.urls[this.i]);
	},
	fetchUrl: function(url) {
		fetch(url).then(data => data.json()).then(json => {

			this.callback(json);

			if (this.i < this.urls.length - 1) {
				this.i++;
				this.fetchUrl(this.urls[this.i]);
			} else {
				log(`Fetch all (${this.i+1}) completed.`);
			}
		});
	}
}

/****************************************** RANDOM FUNCTIONS *************************************/

function _readGameData() {
	fetch("gamedata.json").then(data => data.json()).then(json => {
		console.log(json);
		let newData = {};
		for (champ in json) {
			newData[champ] = {};
			json[champ].forEach(arr => {
				let s = arr[0].replace(`  /Characters/${champ}/`, "").replace(`  /mSpell`, "");

			 	if (!newData[champ][s])
			 		newData[champ][s] = {};

			 	let d = arr[2];
			 	if (d["__type"])
			 		d = arr[2]["__type"];
			 	else if (Array.isArray(d))
			 		d = d.join(', ');
			 	newData[champ][s][arr[1]] = d;
			})
		}
		console.log(newData);
		findValueInJson(newData, "PositiveEffect_MoveBlock");
	});
}

function findValueInJson(json, value) {
	console.log("he");
	let champsOnly = [];
	let newArr = {};
	for (champ in json) {
		for (section in json[champ]) {
			if (!json[champ][section].mSpellTags) continue;
			if (!json[champ][section].mSpellTags.includes(value)) continue;
			if (!newArr[champ]) newArr[champ] = [];
			newArr[champ].push(section);
			if (!champsOnly.includes(champ)) champsOnly.push(champ);
		}
	}
	console.log(newArr);
	console.log(champsOnly);
}