var autocomplete = {
	i: -1,      // last highlight index //what happens to hover :(
	length: 0,  // item count
	limit:  6,  // limit //TODO ? lower for mobile
	isVisible: function() { return $id("search__autocomplete").childElementCount > 0; },

	/***
	 * Generates list of suggestions by comparing search.text to tags.name.
	 */
	run(text) {
		this.reset();
		if (text.length < 2) return;
		for (let item of tags.filter(tag => {
			if (tag.name.toLowerCase().indexOf(text) > -1) return this;
		})) {
			if (this.length == this.limit) break;
			this.length++;
			this.createItem(item.id, item.name)
		}
	},

	/***
	 * Clears the list and removes elements.
	 */
	reset() {
		this.i = -1;
		this.length = 0;
		while ($id("search__autocomplete").lastChild) {
			$id("search__autocomplete").removeChild($id("search__autocomplete").lastChild);
		}
	},

	createItem(tagId, tagName) {
		let div = document.createElement("div");
		// div.setAttribute("id", this.id + "autocomplete-list");
      	div.setAttribute("class", "search__autocomplete-item");
      	div.innerHTML += tagName;
      	div.innerHTML += `<input type='hidden' tag-id="${tagId}" tag-name="${tagName}">`;

      	div.addEventListener("click", function(e) {
      		autocomplete.select(this);
      	});

      	$id("search__autocomplete").appendChild(div);
	},

	select(THIS) {
		// if THIS is null, get dropdownItem by index.
		if (THIS == null) {
			if (autocomplete.i == -1) autocomplete.i = 0;
			THIS = $class("search__autocomplete-item")[autocomplete.i];
		}

		let tagId = THIS.getElementsByTagName("input")[0].getAttribute("tag-id");
		search.queryAdd(null, null, tags.find(tag => tag.id == tagId));
		search.softClear();
		autocomplete.reset();
		autocompleteChampNames.hide();
	},

	/****************************************** HIGHLIGHT ****************************************/

	focus() {
		$class("search__autocomplete-item-active")[0]?.classList.remove("search__autocomplete-item-active");
		$class("search__autocomplete-item")[autocomplete.i]?.classList.add("search__autocomplete-item-active");
	},

	focusNext() { 
		if (this.i == this.length - 1) return;
		this.i += 1;
		autocomplete.focus();
	},

	focusPrev() { 
		if (this.i <= 0) return;
		this.i -= 1;
		autocomplete.focus();
	},

};

var autocompleteChampNames = {
	arr: [],
	suggestion: null,

	addChampions() {
		champions.forEach(champ => {
			this.arr.push({
				search: champ.name.toLowerCase().replace(/[^0-9a-z]/g, ""),
				text: champ.name
			});
		});
	},

	addAliases(arr) {
		this.arr.push(...arr);
	},

	/******************************************************************************/

	/***
	 * Generates list of suggestions by comparing search.text to tags.name.
	 */
	run(text) {

		//too short, hide
		if (text.length < 2)  {
			this.hide();
			return;
		}

		//get rid of spaces and non-letter chars
		text = text.replace(/[^0-9a-z]/g, "");

		//find suggestion
		for (let item of this.arr) {
			if (item.search.includes(text)) {
				this.showSuggestion(text, item.text)
				return;
			}
		}

		//no suggestions
		this.hide();
	},

	showSuggestion(search, text) {
		this.suggestion = text;
		$id("search__autocomplete-champ__text").textContent = this.suggestion;
		$id("search__autocomplete-champ").style.setProperty('--char-length', search.length+"ch");
		$id("search__autocomplete-champ").classList.add("show");
	},

	fill() {
		if (this.suggestion == null) return;
		$id("search").value = this.suggestion;
		$id("search").dispatchEvent(new Event("input"));
		this.hide();
	},

	hide() {
		this.suggestion = null;
		$id("search__autocomplete-champ").classList.remove("show");
	},

	isVisible() {
		return this.suggestion != null;
	}
}