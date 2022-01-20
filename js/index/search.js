var search = {
	text: "",
	tagId: 0,
	hasFocus: false,
	lastFocuTime: 0,

	/****************************************** Search Input Listener ******************************************/

	onKeyUp: function(e) {
		let s = $id("search").value.trim().toLowerCase();
		this.text = s;

		if (s.length == 0) {
			search.clear();
			return;
		}

		$id("search__clear").classList.remove("hide");

		window.scrollTo({top: 0});
		sidebar.clearSelection();

		if (!search.byTagText(s))
		if (!search.byAttr("region", s, true))
		if (!search.byAttr("species", s, true))
			search.byText(s);
		
		champlist.selectFirstVisibleItem();
		champlist.updateItemCount();
	},

	/****************************************** Search Input Methods ******************************************/
	
	clear: function() {
		$id("search").value = "";
		$id("search__clear").classList.add("hide");
		sidebar.clearSelection();
		champlist.deselect();
		champlist.unhideAll();
		champlist.updateItemCount();
	},
	clearInput: function() {
		$id("search").value = "";
		$id("search__clear").classList.add("hide");
	},
	fakeInput: function(s) {
		this.text = s.toLowerCase();
		$id("search").value = s;
		$id("search__clear").classList.remove("hide");
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

		search.tagId = tag.id;
		sort.reset();
		champlist.hideAllExcept(tag.champIndexes);
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