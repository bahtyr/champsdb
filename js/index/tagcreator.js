var TagCreator = {

	modal: new Modal("modal-tagcreator"),
	
	showModal: function() {
		this.modal.show();
		this.printList();
	},

	printList: function(champIndexes) {
		let listId = "tagcreator-champlist",
			listIdActive = "tagcreator-champlist-active",
			listIdAll = "tagcreator-champlist-all";
		let onClickAbility = this.onClickAbility;
		let filter = champIndexes && Array.isArray(champIndexes);
		$id(listId).scrollTop = 0;
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

			["-","P","Q","W","E","R"].forEach((t, abilityIndex) => {
				let s = document.createElement("span");
				s.appendChild(document.createTextNode(t));
				s.onclick = function(event) { onClickAbility(event, abilityIndex, champIndex, champ.name); };
				s.setAttribute("data-ability-index", abilityIndex);

				if (filter && champ.tagArrays[abilityIndex].includes(tags[pageManager.selectedTagIndex].id))
					s.classList.add("highlight");

				div.appendChild(s);
			});
			
			if (filter && champIndexes.includes(champIndex))
				$id(listIdActive).appendChild(div);
			else $id(listIdAll).appendChild(div);
		});
	},

	/******************************************************************************/

	onClickAbility(event, abilityIndex, champIndex, champName) {
		event.srcElement.classList.toggle("highlight");
	}
}