var TagCreator = {

	/**
	 * User flow of how the creator will/should be used;
	 * 1. Modal is shown
	 * 2. Champion list is printed.
	 * 3. Filter;
	 *    - User can input a list of champs separated with commas
	 *    - The text format should be: ChampName#AbilityIndex, 0-5/P-R
	 *      - '#' should be ommitted if tag is for the champ.
	 *    - Pressing enter key reads the filter
	 * 4. Filtered champs are re-printed to a separate list.
	 * 5. Create;
	 *    - read filters arr
	 *    - read champions list
	 */

	// reset on hide 

	modal: new Modal("modal-tagcreator"),

	/****************************************** LISTS *****************************/
	
	list: [],

	/**
	 * champName: full champ name
	 * ability:   tagArrays index: 0 = champ, 1-6 = PQWER
	 */
	addToList(champName, champIndex, ability) {
		let item = TagCreator.list.find(item => item.name == champName);
		if (item) {
			if (!item.abilities.includes(ability))
				item.abilities.push(ability);
			return;
		}

		TagCreator.list.push({name: champName, index: champIndex, abilities: [ability]});
		return;
	},

	removeFromList(champName, ability) {
		let i = TagCreator.list.findIndex(item => item.name == champName);
		if (i > -1) {
			let pos = TagCreator.list[i].abilities.findIndex(item => item == ability);
			if (pos > -1) TagCreator.list[i].abilities.splice(pos, 1);
			if (TagCreator.list[i].abilities.length == 0) TagCreator.list.splice(i, 1);
		}
	},

	/****************************************** UI ********************************/

	showModal() {
		this.modal.show();
		this.printList();
	},

	printList(list) {
		let listId = "tagcreator-champlist",
			listIdActive = "tagcreator-champlist-active",
			listIdAll = "tagcreator-champlist-all";
		let onClickAbility = this.onClickAbility;
		let filter = list && Array.isArray(list);
		// $id(listId).scrollTop = 0;
		$id(listIdActive).innerHTML = "";
		$id(listIdAll).innerHTML = "";

		champions.forEach((champ, champIndex) => {
			let div = document.createElement("div");
			let img = document.createElement("img");
			let label = document.createElement("label");
			img.setAttribute("src", champ.portrait);
			label.appendChild(document.createTextNode(champ.name));
			div.appendChild(img);
			div.appendChild(label);
			div.classList.add("tagcreator__champ-row")
			div.setAttribute("data-champ-index", champIndex);

			let filterIndex = list?.findIndex(item => item.name == champ.name) ?? -1;

			["-","P","Q","W","E","R"].forEach((t, abilityIndex) => {
				let span = document.createElement("span");
				span.appendChild(document.createTextNode(t));
				span.onclick = function(event) { onClickAbility(event, abilityIndex, champIndex, champ.name); };
				span.setAttribute("data-ability-index", abilityIndex);

				if (filterIndex > -1 && list[filterIndex].abilities.includes(abilityIndex))
					span.classList.add("highlight");

				div.appendChild(span);
			});
			
			if (filterIndex > -1)
				$id(listIdActive).appendChild(div);
			else $id(listIdAll).appendChild(div);
		});
	},

	onClickAbility(event, abilityIndex, champIndex, champName) {
		event.srcElement.classList.toggle("highlight");

		if (event.srcElement.classList.contains("highlight")) {
			TagCreator.addToList(champName, champIndex, abilityIndex);
		} else TagCreator.removeFromList(champName, abilityIndex);
	},

	onClickRefresh() {
		this.printList(this.list);
	},

	onClickFilter() {
		let input = $id("tagcreator__input-champs").value.split(/[,\n]/g);

		for (let text of input) {
			if (text.length < 2) return;

			text = text.split("#");
			let champName = TagCreator.findChampName(text[0]);
			let champIndex = champions.findIndex(champ => champ.name == champName);
			let ability = text.length == 2 ? parseInt(text[1])+1 : 0;

			if (champIndex > -1)
				TagCreator.addToList(champName, champIndex, ability)
		}

		TagCreator.printList(TagCreator.list);
	},

	onClickSave() {
		let name = $id("tagcreator__input-name").value.trim();
		let id = TagFunctions.createTag(name);
		TagCreator.list.forEach(item => {
			item.abilities.forEach(ability => {
				TagFunctions.addToChamp(id, item.index, ability);
			});
		});
		TagCreator.updateChamps();
		TagCreator.updateTags();
	},

	/******************************************************************************/

	findChampName(text) {
		text = text.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
		for (let champ of autocompleteChampNames.arr) {
			if (champ.search == text) {
				return champ.text;
			}
		}
		return null;
	},

	updateChamps() { TagCreator.updateData("champions", champions); },
	updateTags() {
		tags.forEach(tag => { tag.champIndexes = []; });
		TagCreator.updateData("tags", tags);
		TagFunctions.initIndexes();
	},
	updateData(fileName, data) {
		console.log(`Updating ${fileName}.`);
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => (xhr.readyState === 4) && console.log(xhr.responseText);
		xhr.open("POST", "./js/server/update.php?file="+fileName, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.send(JSON.stringify(data, null, 2));
	},
}