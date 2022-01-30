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

	onKeyUp: function(e) {
		let s = $id("search").value.trim().toLowerCase();
		this.text = s;

		// if (s.length == 0) {
			// search.clear();
			// $id("search__bubble").classList.remove("active");
			// return;
		// }

		$id("search__bubble").classList.add("active");
		// $id("search__clear").classList.remove("hide");

		window.scrollTo({top: 0});
		search.runQuery();
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
		for (let i in search.query)
			search.query[i].toggleEl.classList.remove("active");
		search.query = [];
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
		$id("search__bubble").classList.add("active");
	},

	hideBubble: function() {
		$id("search").placeholder = "Search";
		$id("search__bubble").classList.remove("active");
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

	queryAdd: function(toggleEl, attr, tag) {
		let el = this.createTag(attr?.value ?? tag?.name);
		this.query.push({toggleEl: toggleEl, attr: attr, tag: tag, element: el});
		search.runQuery();
	},

	queryRemove: function(attr, tag, el, index) {
		for (let i in search.query) {
			if (attr) {
				if (attr.key === search.query[i].attr.key && attr.value === search.query[i].attr.value) {
					index = i;
					break;
				}
			}
			else if (tag) {
				if (tag.id === search.query[i].tag.id && tag.name === search.query[i].tag.name) {
					index = i;
					break;
				}
			}
			else if (el) {
				if (el === search.query[i].element) {
					index = i;
					break;
				}
			}
		}

		if (index == null) return;
		if (search.query[index].toggleEl)
			search.query[index].toggleEl.classList.remove("active");
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
		
		champlist.deselect();

		champions.forEach((champ, i) => {
			let show = search.query.length == 0 ? true : null;
			search.query.forEach(condition => {
				if (condition.attr) {
					if (champ[condition.attr.key].includes(condition.attr.value) && show !== false)
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
		champlist.updateItemCount();
		champlist.showAbilityKeysOnChamps2();
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
	}
};