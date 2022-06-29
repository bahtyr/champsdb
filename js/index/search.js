var search = {
	el: $id("search"),
	hasFocus: false,
	lastFocuTime: 0,
	text: "",
	query: [],

	/****************************************** Search Input Listener ****************************/

	onInput: function(e) {
		window.scrollTo({top: 0});
		search.text = $id("search").value.trim().toLowerCase().replace(/[^\w\s]/g, "");
		search.runQuery();
		autocomplete.run(this.text);
		autocompleteChampNames.run(this.text);
	},

	/****************************************** Search Input Methods *****************************/
	
	clear: function() {
		$id("search").value = "";
		$id("search").placeholder = "Search";
		$id("search__tags").innerHTML = ""
		autocomplete.reset();
		autocompleteChampNames.hide();
		champlist.deselect();
		champlist.unhideAll();
		champlist.updateItemCount();
		search.text = "";
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

	/****************************************** TAG UI *******************************************/

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

	/****************************************** QUERY MEHTOD *************************************/

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

	queryTags: function() {
		return search.query
			.filter(condition => condition.tag)
			.map(condition => condition.tag.id);
	},

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

		sort.reset();
		champlist.deselect();
		champlist.resetPosition();

		champions.forEach((champ, i) => {

			let show = search.query.length == 0 ? true : null; //show all if query is empty
			search.query.forEach(condition => {

				// ATTRS

				if (condition.attr && show !== false) {
					let keys = condition.attr.key.split("/");
					let attr = null;
					switch (keys.length) {
						default:
						case 1: attr = champ[keys[0]]; break;
						case 2: attr = champ[keys[0]][keys[1]]; break;
						case 3: attr = champ[keys[0]][keys[1]][keys[2]]; break;
					}

					if (keys[keys.length-1] == "damageBreakdown") {
						switch (condition.attr.value) {
							case "ad":   if (champ.ratings.damageBreakdown.physical > 20) show = true; else show = false; break;
							case "ap":   if (champ.ratings.damageBreakdown.magic > 20)    show = true; else show = false; break;
							case "true": if (champ.ratings.damageBreakdown.true_ > 10)    show = true; else show = false; break;
						}
					}
					else if  (keys[keys.length-1] == "style") {
						let style = champ.ratings.style;
						switch (condition.attr.value) {
							case "attack":  if (style >= 0 && style <= 40)   show = true; else show = false; break;
							case "both":    if (style >= 40 && style <= 60)  show = true; else show = false; break;
							case "ability": if (style >= 60 && style <= 100) show = true; else show = false; break;
						}
					}
					else if ((typeof attr === "number" && attr == condition.attr.value) || 
						((typeof attr === "string" || Array.isArray(attr)) && 
							attr.includes(condition.attr.value))) {
						show = true;
					}
					else show = false;
				}

				// TAGS

				else if (condition.tag && show !== false) {
					let any = false;
					champ.tagArrays.forEach(arr => { if(arr.includes(condition.tag.id)) any = true; });
					if (any) show = true;
					else show = false;
				}
			});

			// TEXT

			if (search.text.length > 0 && show !== false) {
				if (champ.searchableText().toLowerCase().includes(search.text))
					show = true;
				else show = false;
			}

			// FINALLY SHOW

			if (show)
				champlist.show(i);
			else champlist.hide(i);
		});

		// search.query.length == 0 ? : ;
		champlist.selectFirstVisibleItem();
		champlist.updateItemCount();
		champlist.showAbilityKeysOnChamps();
		filters.attributes.highlight();
	},
};