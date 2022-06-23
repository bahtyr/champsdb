var autocomplete = {
	i: -1,      // last highlight index //what happens to hover :(
	length: 0,  // item count
	limit:  6,  // limit //TODO ? lower for mobile
	isVisible: function() { return $id("search__autocomplete").childElementCount > 0; },

	/***
	 * Generates list of suggestions by comparing search.text to tags.name.
	 */
	run() {
		this.reset();
		if (search.text.length < 2) return;
		for (let item of tags.filter(tag => {
			if (tag.name.toLowerCase().indexOf(search.text) > -1) return this;
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