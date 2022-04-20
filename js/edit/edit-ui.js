class EditUiManager {

	/*
	 * for functions I tried using just: ddragon.getChamps, and run it as funcs[0][0](), however doing so messed up the respective objects' 'this' calls.
	 * changing objects' vars to static would solve the issue, but it would require lots of changes and complicate objects' code.
	 * Related Article? : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#binding_this_with_prototype_and_static_methods
	 */
	funcs = [
		["ddragon.getChamps", function() { ddragon.getChamps() }],
		["ddragon.getChampAbilities", function() { ddragon.getChampAbilities() }],
		["ddragon.getChampLoreInfo", function() { ddragon.getChampLoreInfo() }],
		["ddragon.getChampAbilityVideos", function() { ddragon.getChampAbilityVideos() }],
		["cdragon.getChampRatings", function() { cdragon.getChampRatings() }],
		["thirdparties.getGolChampUrls", function() { thirdparties.getGolChampUrls() }],
		["thirdparties.getChampDamageBreakdown", function() { thirdparties.getChampDamageBreakdown() }]
	];

	constructor() {}

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