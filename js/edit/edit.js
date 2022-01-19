var champions = [];
var tags      = [];

fetch("data/champions.json").then(data => data.json()).then(json => {
	champions = json.map(item => ChampionFunctions.transfer(item));
});

fetch("data/tags.json").then(data => data.json()).then(json => {
	tags = json;
});

/****************************************** RANDOM FUNCTIONS *************************************/

function _addTagToChamps(tagId) {
	if (tagId == null) return;
	let input = $tag("textarea")[0].value.split(/\r|\n/);
	input.forEach(e => _addTagToChamp(tagId, e));
}

function _addTagToChamp(tagId, champString) {
	let s = champString.split("#");
	let champName = s[0];
	let tagArraysIndex = s.length == 2 ? parseInt(s[1])+1 : 0;

	champ = champions.find(({ids}) => ids.pascal.toLowerCase() === champName.toLowerCase());
	if (champ)
		champ.tagArrays[tagArraysIndex].push(tagId);
	else console.error("Champion not found: " + champString);
}

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
	});
}