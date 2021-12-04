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
		$.ajax({type: "GET", url: "data.json", dataType: "json",
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
				break;
			default: console.error(`! ${attribute} does not match any champion attributes.`); return;
		}

		champion[attribute] = value;
	}

	static getUrlWiki() { }

	static getUrlUniverse() { }

	static sortComparison(a, b) {
		if (a.name < b.name)
			return -1;
		else if (a.name > b.name)
			return 1;
		return 0;
	}

	static clipboardTextBuilder(mode, champName, abilityName, abilityNo) {

	}
}

class Tags {
	tags;
	champs;
	aliases;

	constructor() { }

	static loadTags(callback) {
		$.ajax({type: "GET", url: "data-tags.json", dataType: "json",
			success: (data, textStatus) => callback(data),
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	static combineChampsAndTags(tagsObj, useChampIndex) {
		for (let champ in tagsObj.champs) { // for each champ
			for (let t in tagsObj.champs[champ].tags) { // loop their tag ids
				//
				for (let tt in tagsObj.tags) { // search for the tag
					if (tagsObj.tags[tt].id == tagsObj.champs[champ].tags[t]) {
						if (useChampIndex == null) {
							if (tagsObj.tags[tt].champs == null)
								tagsObj.tags[tt].champs = [];
							tagsObj.tags[tt].champs.push(champ);
						} else {
							if (tagsObj.tags[tt].champIndexes == null)
								tagsObj.tags[tt].champIndexes = [];
							tagsObj.tags[tt].champIndexes.push(tagsObj.champs[champ].index);
						}
					}
				}
			}
		}
	}
}