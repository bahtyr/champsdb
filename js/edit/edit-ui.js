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

	populateChampsFields() {
		this.loopAndPrintEntries(champions[0], $id("champ-block-data"), 0);
	}

	/****************************************** PRINT FIELDS *************************************/

	loopAndPrintEntries(obj, container, indent) {
		Object.entries(obj).sort().forEach(entry => {
			if (Array.isArray(entry[1]) || typeof entry[1] === "object") {
				this.printLabel("champ-block-data", entry[0], indent);
				let newRow = this.printRow(container);
				this.loopAndPrintEntries(entry[1], newRow, indent + 1)
			}
			else if (typeof entry[1] === "function") { }
			else this.printInputField(container, "text", entry[0], entry[1], indent);
		});
	}

	printRow(container) {
		let div = document.createElement("div");
		div.classList.add("row");
		container.appendChild(div);
		return div;
	}

	printInputField(container, type, label, value, indent) {
		let label_ = document.createElement("label");
		let input = document.createElement("input");
		let br = document.createElement("br");
		label_.innerHTML = label;
		label_.setAttribute("indent", indent);
		input.setAttribute("type", type);
		input.setAttribute("placeholder", label);
		input.classList.add("input-block");
		input.classList.add("row");
		if (value) input.setAttribute("value", value);
		container.appendChild(label_);
		container.appendChild(input);
		container.appendChild(br);
	}

	printLabel(containerId, label, indent) {
		let label_ = document.createElement("label");
		let br = document.createElement("br");
		label_.innerHTML = label;
		label_.classList.add("collapsible-header");
		label_.setAttribute("indent", indent);
		$id(containerId).appendChild(label_);
		$id(containerId).appendChild(br);
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
