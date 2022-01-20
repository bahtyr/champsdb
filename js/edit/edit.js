var champions = [];
var tags      = [];

fetch("data/champions.json").then(data => data.json()).then(json => {
	champions = json.map(item => ChampionFunctions.transfer(item));
});

fetch("data/tags.json").then(data => data.json()).then(json => {
	tags = json;
});

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

function _addTagToChamps(tagId) {
	if (tagId == null) return;
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
	if (tagId == null) return;
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