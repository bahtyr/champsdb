/**
 * These classes are not used to created objects. The variables are here only for reference.
 * Mainly they contain the loader methods and a few helper methods (to be used from Editor or List manager classes).
 */

class Champion {
	id;
	name;
	title;
	portrait;
	splash;
	splashPosition;
	abilities = []; // {name: , img: }
	tags = [];      // string (roles)
	lanes;          // string

	constructor() { }

	static loadChampions(callback) {
		$.ajax({type: "GET", url: "data.json?v=0.2.36", dataType: "json",
			success: (data, textStatus) => callback(data),
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	static setAttribute(champion, attribute, value) {
		switch (attribute) {
			case "id":
			case "name":
			case "title":
			case "portrait":
			case "splash":
			case "splashPosition":
			case "abilities":
			case "tags":
			case "lanes":
			case "region":
			case "species":
			case "releaseDate":
				break;
			default: console.error(`! ${attribute} does not match any champion attributes.`); return;
		}

		champion[attribute] = value;
	}

	static getUrlWikiLore(champName) {
		return `https://leagueoflegends.fandom.com/wiki/${champName.replace("\\s","_")}`
	}

	static getUrlWiki(champName) {
		return `https://leagueoflegends.fandom.com/wiki/${champName.replace("\\s","_")}/LoL#Abilities`
	}

	static getUrlWikiPatchHistory(champName) {
		return `https://leagueoflegends.fandom.com/wiki/${champName.replace("\\s","_")}/LoL/Patch_history`
	}

	static getUrlUniverse(champId) {
		return `https://universe.leagueoflegends.com/en_SG/champion/${champId}/`;
	}

	static clipboardTextBuilder(mode, champName, abilityName, abilityNo) {

	}

	static sortByName(a, b) {
		if (a.name < b.name) return -1;
		else if (a.name > b.name) return 1;
		return 0;
	}

	static sortByNameDesc(a, b) {
		if (a.name > b.name) return -1;
		else if (a.name < b.name) return 1;
		return 0;
	}

	static sortByReleaseDateDesc(a, b) {
		let a_ = new Date(a.releaseDate).getTime();
		let b_ = new Date(b.releaseDate).getTime();
		if (a_ < b_) return -1;
		else if (a_ > b_) return 1;
		return Champion.sortByName(a, b);
	}

	static sortByReleaseDateDesc(a, b) {
		let a_ = new Date(a.releaseDate).getTime();
		let b_ = new Date(b.releaseDate).getTime();
		if (a_ > b_) return -1;
		else if (a_ < b_) return 1;
		return Champion.sortByNameDesc(a, b);
	}
}

class Tags {
	tags;
	champs;
	aliases;
	menu;

	constructor() { }

	static loadTags(callback) {
		$.ajax({type: "GET", url: "data-tags.json?v=0.2.32", dataType: "json",
			success: (data, textStatus) => callback(data),
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	static combineChampsAndTags(tagsObj, useChampIndex) {
		Tags.combineAliasesAndChampTags(tagsObj);

		// for every champion's tag arrays' tags
		for (let champ in tagsObj.champs) { //champ
			for (let arr in tagsObj.champs[champ].tagArrays) { //tagArrays = Array(6)
				for (let champTag in tagsObj.champs[champ].tagArrays[arr]) { //tagArrays[arr] = [tag, ...]

					// loop tags to find matching tags
					for (let tag in tagsObj.tags) {
						if (tagsObj.tags[tag].id == tagsObj.champs[champ].tagArrays[arr][champTag]) {

							if (useChampIndex == null) {
								if (tagsObj.tags[tag].champNames == null) tagsObj.tags[tag].champNames = [];
								tagsObj.tags[tag].champNames.push(champ);
							} else {
								if (tagsObj.tags[tag].champIndexes == null) tagsObj.tags[tag].champIndexes = [];
								tagsObj.tags[tag].champIndexes.push(tagsObj.champs[champ].index);
							}
						}
					}
				}
			}
		}
	}

	/**
	 * For each champion,
	 * loop their tags,
	 * for each tag array,
	 * loop each alias,
	 * if (tag == alias)
	 */
	static combineAliasesAndChampTags(tagsObj) {
		for (let champ in tagsObj.champs) { //champ
			for (let arr in tagsObj.champs[champ].tagArrays) { //tagArrays = Array(6)
				let tagsLength = tagsObj.champs[champ].tagArrays[arr].length;
				for (let tag in tagsObj.champs[champ].tagArrays[arr]) { //tagArrays[arr] = [tag, ...]

					//loop aliases to find matching tags
					for (let alias in tagsObj.aliases) {
						if (tagsObj.champs[champ].tagArrays[arr][tag] == tagsObj.aliases[alias].tagId)
							tagsObj.champs[champ].tagArrays[arr].push(tagsObj.aliases[alias].aliasId);
					}
				}
			}
		}
	}
}