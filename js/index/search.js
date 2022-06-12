var search = {
	el: $id("search"),
	text: "",
	tagId: 0,
	hasFocus: false,
	lastFocuTime: 0,
	filterVisibleItemsOnly: function() { return this.query.length > 1; },
	query: [],
	prefs: {
		text: 1,
		tags: 0
	},

	/****************************************** Search Input Listener ******************************************/

	onInput: function(e) {
		let s = $id("search").value.trim().toLowerCase();
		this.text = s;

		// if (s.length == 0) {
			// search.clear();
			// $id("search__bubble").classList.remove("active");
			// return;
		// }

		// $id("search__bubble").classList.add("active");
		// $id("search__clear").classList.remove("hide");

		window.scrollTo({top: 0});
		search.runQuery();
		autocomplete.run();
		// sidebar.clearSelection();

		// if (!search.byTagText(s))
		// if (!search.byAttr("region", s, true))
		// if (!search.byAttr("species", s, true))
			// search.byText(s);
		
		// champlist.selectFirstVisibleItem();
		// champlist.updateItemCount();
	},

	/****************************************** Search Input Methods ******************************************/
	
	clear: function() {
		$id("search").value = "";
		$id("search__bubble").classList.remove("active");
		$id("search").placeholder = "Search";
		$id("search__tags").innerHTML = ""
		champlist.deselect();
		champlist.unhideAll();
		champlist.updateItemCount();
		search.text = "";
		search.tagId = null;
		for (let i in search.query) {
			if (search.query[i].toggleEl) {
				search.query[i].toggleEl.classList.remove("active");
				search.query[i].toggleEl.checked = false;
			}
		}
		search.query = [];
	},

	/***
	 * Does not empty the whole search query, only removes the search text. Re-runs the query to search with existing tags. (used with autocomplete).
	 */
	softClear: function() {
		$id("search").value = "";
		search.text = "";
		search.runQuery();
	},

	fakeInput: function(s) {
		this.text = s.toLowerCase();
		$id("search").placeholder = "";
		$id("search__clear").classList.remove("hide");
		$id("search__bubble").classList.add("active");
		this.createTag(s);
	},

	showBubble: function() {
		$id("search").placeholder = "";
		// $id("search__bubble").classList.add("active");
	},

	hideBubble: function() {
		$id("search").placeholder = "Search";
		// $id("search__bubble").classList.remove("active");
	},

	/******************************************/

	createTag: function(s) {
		let p = document.createElement("p");
		p.textContent = s;
		$id("search__tags").appendChild(p);
		return p;
	},

	destroyTag: function(s) {
		$queryAll("#search__tags p").forEach(e => {
			e.textContent === s && e.remove();
		})
	},

	/****************************************** QUERY MEHTOD *****************************************************/

	/**
	 * attr{key, value}
	 * tag {id, name, champIndexes[] }
	 * 
	 * 
	 * reserved tag.ids
	 *   -1: not a tag
	 *   -2: region
	 *   -3: species
	 * 
	 * note:
	 * 	 at one point, champs' attributes such as attackRangeType / resourceType used to be searched by their attributes rather being a tag.
	 *   now each champ has those attributes as tags as well.
	 *   so, currently there is no
	 */

	queryAdd: function(toggleEl, attr, tag) {
		let el = this.createTag(attr?.value ?? tag?.name);
		this.query.push({toggleEl: toggleEl, attr: attr, tag: tag, element: el});
		search.runQuery();
	},

	queryRemove: function(attr, tag, el, index) {
		for (let i in search.query) {
			if (attr && search.query[i].attr) {
				if (attr.key === search.query[i].attr.key && attr.value === search.query[i].attr.value) {
					index = i;
					break;
				}
			}
			else if (tag && search.query[i].tag) {
				if (tag.id === search.query[i].tag.id && tag.name === search.query[i].tag.name) {
					index = i;
					break;
				}
			}
			else if (el && search.query[i].el) {
				if (el === search.query[i].element) {
					index = i;
					break;
				}
			}
		}

		if (index == null) return;
		if (search.query[index].toggleEl) {
			search.query[index].toggleEl.classList.remove("active");
			search.query[index].toggleEl.checked = false;
		}
		search.query[index].element.remove();
		search.query.splice(index, 1);
		search.runQuery();
	},

	runQuery: function() {
		/**
		 * normally i would not want this mehtod to anything besides checking champ values and toggling their visibility,
		 * however, this method can be run from multiple methods.
		 * therefore it is better if we handle follow-up methods here as well.
		 */

		search.text = search.text.replace(/[^\w\s]/g, "")

		champlist.deselect();
		champlist.resetPosition();

		champions.forEach((champ, i) => {
			let show = search.query.length == 0 ? true : null;
			search.query.forEach(condition => {
				if (condition.attr) {
					let keys = condition.attr.key.split("/");
					let attr = null;
					switch (keys.length) {
						default:
						case 1: attr = champ[keys[0]]; break;
						case 2: attr = champ[keys[0]][keys[1]]; break;
						case 3: attr = champ[keys[0]][keys[1]][keys[2]]; break;
					}
					if (show !== false && 
						((typeof attr === "number" && attr == condition.attr.value) || 
							((typeof attr === "string" || Array.isArray(attr)) && attr.includes(condition.attr.value))))
						show = true;
					else show = false;
				}

				else if (condition.tag && show !== false) {
					let any = false;
					champ.tagArrays.forEach(arr => { if(arr.includes(condition.tag.id)) any = true; });
					if (any) show = true;
					else show = false;
				}
			});

			if (search.text.length > 0 && show !== false) {
				if (champ.searchableText().toLowerCase().includes(search.text))
					show = true;
				else show = false;
			}

			if (show)
				champlist.show(i);
			else champlist.hide(i);
		});

		search.query.length == 0 
			? search.hideBubble()
			: search.showBubble();
		champlist.selectFirstVisibleItem();
		champlist.updateItemCount();
		champlist.showAbilityKeysOnChamps2();
		filters.attributes.highlight();
	},

	queryTags: function() {
		return search.query
			.filter(condition => condition.tag)
			.map(condition => condition.tag.id);
	},

	/****************************************** Champion Search Methods ******************************************/

	/**
	 * every method except byText() returns true || false.
	 * the methods either use:
	 * - loop champions -> then use champlist.show/hide(index) onebyone
	 * - loop tags -> then use champlist.hideAllExcept(index[])
	 *                         (which eventually uses champlist.show/hide(index))
	 * 
	 * !! the caller is responsible for handling ui related or other cases, such as showing the clear button, updating result count, etc..
	 *    (the only exception is sort.reset which needs to be executed before using hideAllExcept method)
	 */

	byText: function(s) {
		search.tagId = null;
		champions.forEach((champ, i) => {
			if (champ.searchableText().toLowerCase().includes(s))
				champlist.show(i);
			else champlist.hide(i);
		});
	},
	byAttr: function(attr, text, toLowerCase) {
		search.tagId = null;
		let anyMatchFound = false;
		champions.forEach((champ, i) => {
			if (this.filterVisibleItemsOnly() && champ.hide) return;

			if (toLowerCase 
				? champ[attr].toLowerCase().includes(text) 
				: champ[attr].includes(text)) {
				anyMatchFound = true;
				champlist.show(i);
			} else champlist.hide(i);
		});

		return anyMatchFound;
	},
	byTag: function(tag) {
		search.tagId = null;
		if (!tag) return false;
		this.queryAdd({tagId: tag.id, text: tag.name});

		search.tagId = tag.id;
		// sort.reset();
		champlist.hideAllExcept(tag.champIndexes, search.filterVisibleItemsOnly());
		champlist.showAbilityKeysOnChamps();
		return true;
	},
	byTagText: function(s) {
		return this.byTag(tags.find(({name}) => name.toLowerCase() === s));
	},
	byTagId: function(id_) {
		return this.byTag(tags.find(({id}) => id === id_));		
	},

};

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