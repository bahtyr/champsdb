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

	selectedChampIndex = null;
	selectedTagIndex = null;

	constructor() {}

	/****************************************** PRINT LISTS **************************************/

	populateList(listId, array, onClick, onDblClick) {
		array.forEach((item, index) => {
			let li = document.createElement("li");
			let text = document.createTextNode(item);
			if (onClick) li.onclick = function() { onClick(index) };
			if (onDblClick) li.ondblclick = function() { onDblClick(index) };
			li.appendChild(text);
			document.getElementById(listId).appendChild(li);
		});
	}

	populateChampsList() {
		this.populateList("list-champs", champions.map(champ => champ.name), this.onClickChamp);
	}

	populateTagList() {
		this.populateList("list-tags", tags.map(tag => tag.id + " - " + tag.name), this.onClickTag);
	}

	populateFunctions() {
		this.populateList("list-functions", this.funcs.map(fun => fun[0]), null, this.onClickFunc);
	}

	/****************************************** ONCLICK ******************************************/

	onClickFunc(i) {
		pageManager.funcs[i][1]();
	}

	onClickChamp(i) {

	}

	onClickTag(i) {
		pageManager.selectedTagIndex = i;
		$id("input__tag-id").value = tags[i].id;
		$id("input__tag-name").value = tags[i].name;
	}

}
