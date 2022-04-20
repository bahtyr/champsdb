class EditUiManager {

	funcs = [
		["ddragon.getChamps", ddragon.getChamps],
		["ddragon.getChampAbilities", ddragon.getChampAbilities],
		["ddragon.getChampLoreInfo", ddragon.getChampLoreInfo],
		["ddragon.getChampAbilityVideos", ddragon.getChampAbilityVideos],
		["cdragon.getChampRatings", cdragon.getChampRatings]
	];

	constructor() {
		this.populateFunctions();
	}

	/****************************************** PRINT LISTS **************************************/

	populateList(array, listId) {
		array.forEach(item => {
			let li = document.createElement("li");
			let text = document.createTextNode(item);
			li.appendChild(text);
			document.getElementById(listId).appendChild(li);
		});
	}

	populateChampsList() {
		this.populateList(champions.map(champ => champ.name), "list-champs");
	}

	populateTagList() {
		this.populateList(tags.map(tag => tag.id + " - " + tag.name), "list-tags");
	}

	populateFunctions() {
		this.populateList(this.funcs.map(fun => fun[0]), "list-functions");
	}

}